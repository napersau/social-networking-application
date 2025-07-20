import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  List,
  Avatar,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Modal,
  Upload,
  Image,
  Collapse,
  Dropdown,
  Menu,
} from "antd";
import {
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
  PictureOutlined,
  SendOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { postService } from "../../services/postService";
import { likeService } from "../../services/likeService";
import { commentService } from "../../services/commentService";
import "./styles.css";
import axios from "axios";
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [likingPosts, setLikingPosts] = useState(new Set()); // Track posts being liked
  const [commentingPosts, setCommentingPosts] = useState(new Set()); // Track posts being commented
  const [expandedComments, setExpandedComments] = useState(new Set()); // Track expanded comment sections
  const [form] = Form.useForm();
  const [commentForms] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getPosts();
      if (response.data && response.data.code === 1000) {
        setPosts(response.data.result);
      }
    } catch (error) {
      message.error("Không thể tải danh sách bài viết");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostImageUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload/post-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 1000) {
        const imageUrl = response.data.result.url;
        setUploadedImageUrl(imageUrl);
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: imageUrl,
          },
        ]);

        onSuccess(response.data.result);
      } else {
        onError(new Error("Upload thất bại"));
        message.error("Tải ảnh bài viết thất bại");
      }
    } catch (err) {
      console.error("Upload post image error:", err);
      onError(err);
      message.error("Có lỗi khi tải ảnh");
    }
  };

  const handleCreatePost = async (values) => {
    setCreateLoading(true);
    try {
      const postData = {
        content: values.content,
        imageUrl: uploadedImageUrl, // ✅ chỉ 1 ảnh
      };

      const response = await postService.createPost(postData);
      if (response.data && response.data.code === 1000) {
        message.success("Đăng bài viết thành công!");
        form.resetFields();
        setFileList([]);
        setUploadedImageUrl(null); // reset
        setIsModalVisible(false);
        fetchPosts();
      }
    } catch (error) {
      message.error("Đăng bài viết thất bại");
      console.error("Error creating post:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (likingPosts.has(postId)) {
      return;
    }
    setLikingPosts((prev) => new Set(prev).add(postId));
    try {
      const reactionType = "Like";
      const response = await likeService.likePost(postId, reactionType);
      if (response.data && response.data.code === 1000) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const wasLiked = post.isLiked;
              return {
                ...post,
                isLiked: !wasLiked,
                likes: wasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
              };
            }
            return post;
          })
        );

        const currentPost = posts.find((p) => p.id === postId);
        if (currentPost?.isLiked) {
          message.success("Đã bỏ thích bài viết!");
        } else {
          message.success("Đã thích bài viết!");
        }
      } else {
        message.warning("Không thể thực hiện hành động này!");
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike bài viết:", error);
      message.error("Đã xảy ra lỗi khi thực hiện hành động!");
    } finally {
      // Remove from loading set
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
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = async (postId, content) => {
    if (!content.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    if (commentingPosts.has(postId)) {
      return;
    }

    setCommentingPosts((prev) => new Set(prev).add(postId));

    try {
      const response = await commentService.createComment(
        postId,
        content.trim()
      );

      if (response.data && response.data.code === 1000) {
        // Update the specific post with new comment
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const newComment = response.data.result;
              return {
                ...post,
                comments: [...(post.comments || []), newComment],
                commentCount: (post.commentCount || 0) + 1,
              };
            }
            return post;
          })
        );

        // Reset comment form for this post
        commentForms.setFieldsValue({
          [`comment_${postId}`]: "",
        });

        message.success("Đã gửi bình luận!");
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
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const currentUserId = parseInt(localStorage.getItem("userId"));

    const handleUpdateComment = async (commentId, postId) => {
      if (!editedContent.trim()) {
        message.warning("Nội dung không được để trống!");
        return;
      }

      try {
        const response = await commentService.updateComment(
          commentId,
          editedContent.trim()
        );

        if (response.data && response.data.code === 1000) {
          const updatedComment = response.data.result;

          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const updatedComments = post.comments.map((c) =>
                  c.id === commentId
                    ? { ...c, content: updatedComment.content }
                    : c
                );
                return {
                  ...post,
                  comments: updatedComments,
                };
              }
              return post;
            })
          );

          message.success("Đã cập nhật bình luận!");
          setEditingCommentId(null);
        } else {
          message.error("Không thể cập nhật bình luận!");
        }
      } catch (error) {
        console.error("Lỗi cập nhật bình luận:", error);
        message.error("Đã xảy ra lỗi khi cập nhật bình luận!");
      }
    };

    const confirmDeleteComment = (commentId, postId) => {
      Modal.confirm({
        title: "Xác nhận xóa bình luận",
        content: "Bạn có chắc muốn xóa bình luận này không?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => handleDeleteComment(commentId, postId),
      });
    };

    const handleDeleteComment = async (commentId, postId) => {
      try {
        const response = await commentService.deleteComment(commentId);
        if (response.data && response.data.code === 1000) {
          // Cập nhật lại danh sách comment trong bài viết
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const updatedComments = post.comments?.filter(
                  (c) => c.id !== commentId
                );
                return {
                  ...post,
                  comments: updatedComments,
                  commentCount: Math.max((post.commentCount || 1) - 1, 0),
                };
              }
              return post;
            })
          );
          message.success("Đã xóa bình luận!");
        } else {
          message.error("Không thể xóa bình luận!");
        }
      } catch (err) {
        console.error("Lỗi khi xóa bình luận:", err);
        message.error("Đã xảy ra lỗi khi xóa bình luận!");
      }
    };

    console.log("post", post);

    return (
      <div className="comment-section">
        <Divider className="comment-divider" />

        {/* Comment Input Form */}
        <Form
          form={commentForms}
          onFinish={(values) =>
            handleSubmitComment(post.id, values[`comment_${post.id}`])
          }
        >
          <Form.Item name={`comment_${post.id}`} style={{ marginBottom: 8 }}>
            <div className="comment-input-container">
              <Avatar
                src={post.user.avatarUrl}
                size={32}
                icon={<UserOutlined />}
              />
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
                className="comment-submit-btn"
              >
                Gửi
              </Button>
            </div>
          </Form.Item>
        </Form>

        {/* Comments List */}
        {comments.length > 0 && (
          <div className="comments-list">
            <List
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item
                  key={comment.id}
                  className="comment-item"
                  actions={
                    currentUserId === comment.user?.id ||
                    currentUserId === post.user.id
                      ? [
                          <Dropdown
                            overlay={
                              <Menu>
                                {currentUserId === comment.user?.id && (
                                  <Menu.Item
                                    key="edit"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditedContent(comment.content);
                                    }}
                                  >
                                    Sửa
                                  </Menu.Item>
                                )}
                                <Menu.Item
                                  key="delete"
                                  danger
                                  onClick={() =>
                                    confirmDeleteComment(comment.id, post.id)
                                  }
                                >
                                  Xóa
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={["click"]}
                          >
                            <Button type="text" icon={<MoreOutlined />} />
                          </Dropdown>,
                        ]
                      : []
                  }
                >
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
                            ? new Date(comment.createdAt).toLocaleString(
                                "vi-VN"
                              )
                            : "Vừa xong"}
                        </Text>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div>
                          <TextArea
                            rows={2}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            style={{ marginBottom: 8 }}
                          />
                          <Space>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() =>
                                handleUpdateComment(comment.id, post.id)
                              }
                            >
                              Lưu
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Hủy
                            </Button>
                          </Space>
                        </div>
                      ) : (
                        <Paragraph className="comment-text">
                          {comment.content}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
              split={false}
            />
          </div>
        )}

        {commentCount === 0 && (
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
          <Avatar size={40} src={post.user.avatarUrl} icon={<UserOutlined />} />
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

        <Divider className="post-divider" />

        <div className="post-actions">
          <Button
            type="text"
            icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
            onClick={() => handleLike(post.id)}
            loading={isLiking}
            className={`action-button ${isLiked ? "liked" : ""}`}
            style={{
              color: isLiked ? "#ff4d4f" : undefined,
            }}
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
            className="action-button"
          >
            Chia sẻ {post.shares ? `(${post.shares})` : ""}
          </Button>
        </div>

        {/* Comment Section - Only show when expanded */}
        {isCommentsExpanded && <CommentSection post={post} />}
      </Card>
    );
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Row gutter={[16, 16]} justify="center">
          <Col span={16}>
            {/* Create Post Section */}
            <Card className="create-post-card">
              <div className="create-post-header">
                <Avatar
                  size={40}
                  src={posts[0]?.user?.avatarUrl}
                  icon={<UserOutlined />}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                  className="create-post-button"
                >
                  Tạo bài viết mới
                </Button>
              </div>
            </Card>

            {/* Posts List */}
            <div className="posts-list">
              <Spin spinning={loading}>
                {posts.length === 0 && !loading ? (
                  <Card className="empty-posts">
                    <div className="empty-content">
                      <MessageOutlined className="empty-icon" />
                      <Title level={4}>Chưa có bài viết nào</Title>
                      <Text type="secondary">
                        Hãy tạo bài viết đầu tiên của bạn!
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

      {/* Create Post Modal */}
      <Modal
        title="Tạo bài viết mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setUploadedImageUrl(null);
        }}
        footer={null}
        className="create-post-modal"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePost}>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài viết!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Bạn đang nghĩ gì?"
              className="post-textarea"
            />
          </Form.Item>

          <Form.Item name="images" label="Thêm hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handlePostImageUpload}
              onRemove={() => {
                setFileList([]);
                setUploadedImageUrl(null);
              }}
              accept="image/*"
              maxCount={1} // ✅ chỉ 1 ảnh
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                icon={<SendOutlined />}
              >
                Đăng bài
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostPage;
