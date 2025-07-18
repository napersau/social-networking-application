import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Image,
} from "antd";
import {
  UserOutlined,
  SendOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { postService } from "../../services/postService";
import { likeService } from "../../services/likeService";
import { commentService } from "../../services/commentService";
import { createNotification } from "../../services/notificationService"; // ✅ THÊM DÒNG NÀY
import "./styles.css";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const PostUser = () => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [commentingPosts, setCommentingPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentForms] = Form.useForm();
  const [userInfo, setUserInfo] = useState(null);

  const myId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getPostsByUserId(userId);
      if (response.data && response.data.code === 1000) {
        setPosts(response.data.result);
        if (response.data.result.length > 0) {
          setUserInfo(response.data.result[0].user);
        }
      }
    } catch (error) {
      message.error("Không thể tải danh sách bài viết của người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (likingPosts.has(postId)) return;

    setLikingPosts((prev) => new Set(prev).add(postId));
    try {
      const reactionType = "Like";
      const response = await likeService.likePost(postId, reactionType);
      if (response.data && response.data.code === 1000) {
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            const wasLiked = post.isLiked;
            return {
              ...post,
              isLiked: !wasLiked,
              likes: wasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
            };
          }
          return post;
        });

        const currentPost = posts.find((p) => p.id === postId);
        if (!currentPost?.isLiked && currentPost?.user?.id !== myId) {
          await createNotification({
            userId: currentPost.user.id,
            senderId: myId,
            title: "Bài viết của bạn vừa được thích",
            content: `Bài viết "${currentPost.content?.slice(0, 50)}..." đã được thích.`,
            actionUrl: `/post/${postId}`,
            isRead: false,
            type: "POST_LIKED",
          });
        }

        setPosts(updatedPosts);
        message.success(
          currentPost?.isLiked ? "Đã bỏ thích bài viết!" : "Đã thích bài viết!"
        );
      } else {
        message.warning("Không thể thực hiện hành động này!");
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike bài viết:", error);
      message.error("Đã xảy ra lỗi khi thực hiện hành động!");
    } finally {
      setLikingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleComment = (postId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  const handleSubmitComment = async (postId, content) => {
    if (!content.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    if (commentingPosts.has(postId)) return;

    setCommentingPosts((prev) => new Set(prev).add(postId));
    try {
      const response = await commentService.createComment(postId, content.trim());
      if (response.data && response.data.code === 1000) {
        const newComment = response.data.result;
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), newComment],
              commentCount: (post.commentCount || 0) + 1,
            };
          }
          return post;
        });

        setPosts(updatedPosts);
        commentForms.setFieldsValue({ [`comment_${postId}`]: "" });
        message.success("Đã gửi bình luận!");

        const post = posts.find((p) => p.id === postId);
        if (post?.user?.id !== myId) {
          await createNotification({
            userId: post.user.id,
            senderId: myId,
            title: "Bài viết của bạn vừa được bình luận",
            content: `Ai đó vừa bình luận: "${content.slice(0, 50)}..."`,
            actionUrl: `/post/${postId}`,
            isRead: false,
            type: "POST_COMMENTED",
          });
        }
      } else {
        message.error("Không thể gửi bình luận!");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      message.error("Đã xảy ra lỗi khi gửi bình luận!");
    } finally {
      setCommentingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleShare = (postId) => {
    message.info("Tính năng chia sẻ đang phát triển");
  };

  const CommentSection = ({ post }) => {
    const isCommenting = commentingPosts.has(post.id);
    const comments = post.comments || [];
    const commentCount = post.commentCount || comments.length;

    return (
      <div className="comment-section">
        <Divider />
        <Form
          form={commentForms}
          onFinish={(values) =>
            handleSubmitComment(post.id, values[`comment_${post.id}`])
          }
        >
          <Form.Item name={`comment_${post.id}`}>
            <div className="comment-input-container">
              <Avatar size={32} icon={<UserOutlined />} />
              <TextArea
                placeholder="Viết bình luận..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="comment-input"
                onPressEnter={(e) => {
                  if (e.shiftKey) return;
                  e.preventDefault();
                  const content = e.target.value;
                  handleSubmitComment(post.id, content);
                }}
              />
              <Button
                type="primary"
                htmlType="submit"
                loading={isCommenting}
                icon={<SendOutlined />}
                size="small"
              >
                Gửi
              </Button>
            </div>
          </Form.Item>
        </Form>

        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item key={comment.id} className="comment-item">
                <div className="comment-content">
                  <Avatar
                    size={32}
                    src={comment.user?.avatarUrl}
                    icon={<UserOutlined />}
                  />
                  <div className="comment-bubble">
                    <div className="comment-header">
                      <Text strong>
                        {comment.user?.firstName || "Anonymous"}{" "}
                        {comment.user?.lastName || ""}
                      </Text>
                      <Text type="secondary" className="comment-time">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </Text>
                    </div>
                    <Paragraph>{comment.content}</Paragraph>
                  </div>
                </div>
              </List.Item>
            )}
            split={false}
          />
        ) : (
          <div className="no-comments">
            <Text type="secondary">Chưa có bình luận nào</Text>
          </div>
        )}
      </div>
    );
  };

  const PostCard = ({ post }) => {
    const isLiking = likingPosts.has(post.id);
    const isLiked = post.isLiked || false;
    const likeCount = post.likes?.length || 0;
    const commentCount = post.commentCount || post.comments?.length || 0;
    const isCommentsExpanded = expandedComments.has(post.id);

    return (
      <Card className="post-card" hoverable>
        <div className="post-header">
          <Avatar size={40} src={userInfo?.avatarUrl} icon={<UserOutlined />} />
          <div className="post-user-info">
            <Text strong>
              {post.user.firstName || "Anonymous"} {post.user.lastName}
            </Text>
            <Text type="secondary" className="post-time">
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString("vi-VN")
                : "Vừa xong"}
            </Text>
          </div>
        </div>

        <div className="post-content">
          <Paragraph>{post.content}</Paragraph>
          {post.imageUrl && (
            <div className="post-images">
              <Image src={post.imageUrl} className="post-image" />
            </div>
          )}
        </div>

        <Divider />

        <div className="post-actions">
          <Button
            type="text"
            icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
            onClick={() => handleLike(post.id)}
            loading={isLiking}
            className={`action-button ${isLiked ? "liked" : ""}`}
            style={{ color: isLiked ? "#ff4d4f" : undefined }}
          >
            {isLiked ? "Đã thích" : "Thích"} {likeCount > 0 && `(${likeCount})`}
          </Button>

          <Button
            type="text"
            icon={<CommentOutlined />}
            onClick={() => handleComment(post.id)}
            className={`action-button ${isCommentsExpanded ? "active" : ""}`}
          >
            Bình luận {commentCount > 0 && `(${commentCount})`}
          </Button>

          <Button
            type="text"
            icon={<RetweetOutlined />}
            onClick={() => handleShare(post.id)}
          >
            Chia sẻ {post.shares ? `(${post.shares})` : ""}
          </Button>
        </div>

        {isCommentsExpanded && <CommentSection post={post} />}
      </Card>
    );
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Row gutter={[16, 16]} justify="center">
          <Col span={16}>
            {userInfo && (
              <Card className="user-info-card">
                <div className="user-info-header">
                  <Avatar
                    size={60}
                    src={userInfo.avatarUrl}
                    icon={<UserOutlined />}
                  />
                  <div className="user-info-content">
                    <Title level={3}>
                      {userInfo.firstName} {userInfo.lastName}
                    </Title>
                    <Text type="secondary">{posts.length} bài viết</Text>
                  </div>
                </div>
              </Card>
            )}

            <div className="posts-list">
              <Spin spinning={loading}>
                {posts.length === 0 && !loading ? (
                  <Card className="empty-posts">
                    <div className="empty-content">
                      <MessageOutlined className="empty-icon" />
                      <Title level={4}>
                        Người dùng chưa có bài viết nào
                      </Title>
                      <Text type="secondary">
                        Chưa có bài viết nào được đăng bởi người dùng này.
                      </Text>
                    </div>
                  </Card>
                ) : (
                  <List
                    dataSource={posts}
                    renderItem={(post) => (
                      <List.Item key={post.id} className="post-list-item">
                        <PostCard post={post} />
                      </List.Item>
                    )}
                    split={false}
                  />
                )}
              </Spin>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PostUser;
