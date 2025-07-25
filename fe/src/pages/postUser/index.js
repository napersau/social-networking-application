import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, List, message, Spin, Row, Col } from "antd";
import { postService } from "../../services/postService";
import { likeService } from "../../services/likeService";
import { commentService } from "../../services/commentService";
import { createNotification } from "../../services/notificationService";
import { createPostShare } from "../../services/postShareService";
import UserInfoCard from "./UserInfoCard";
import PostCard from "./PostCard";
import ShareModal from "./ShareModal";
import EmptyPosts from "./EmptyPosts";
import "./styles.css";

const PostUser = () => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [commentingPosts, setCommentingPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentForms] = Form.useForm();
  const [userInfo, setUserInfo] = useState(null);

  // Share modal states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [sharingPostId, setSharingPostId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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
            content: `Bài viết "${currentPost.content?.slice(
              0,
              50
            )}..." đã được thích.`,
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
      const response = await commentService.createComment(
        postId,
        content.trim()
      );
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

  const handleShare = (post) => {
    setSharingPostId(post.id);
    setSelectedPost(post);
    setShareModalVisible(true);
  };

  const handleShareSubmit = async () => {
    if (!shareContent.trim()) {
      message.warning("Vui lòng nhập nội dung chia sẻ");
      return;
    }
    setSharing(true);
    try {
      const response = await createPostShare({
        postId: sharingPostId,
        sharedContent: shareContent.trim(),
      });
      if (response.data && response.data.code === 1000) {
        message.success("Đã chia sẻ bài viết!");
        handleShareModalClose();
        fetchUserPosts();
      } else {
        message.error("Chia sẻ thất bại!");
      }
    } catch (err) {
      message.error("Lỗi khi chia sẻ bài viết!");
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const handleShareModalClose = () => {
    setShareModalVisible(false);
    setShareContent("");
    setSelectedPost(null);
    setSharingPostId(null);
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Row gutter={[16, 16]} justify="center">
          <Col span={16}>
            <UserInfoCard userInfo={userInfo} postsCount={posts.length} />

            <div className="posts-list">
              <Spin spinning={loading}>
                {posts.length === 0 && !loading ? (
                  <EmptyPosts />
                ) : (
                  <List
                    dataSource={posts}
                    renderItem={(post) => (
                      <List.Item key={post.id} className="post-list-item">
                        <PostCard
                          post={post}
                          userInfo={userInfo}
                          likingPosts={likingPosts}
                          expandedComments={expandedComments}
                          setExpandedComments={setExpandedComments}
                          commentingPosts={commentingPosts}
                          commentForms={commentForms}
                          handleLike={handleLike}
                          onLike={handleLike}
                          onComment={handleComment}
                          onShare={handleShare}
                          fetchUserPosts={fetchUserPosts}
                          setPosts={setPosts}
                        />
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

      <ShareModal
        visible={shareModalVisible}
        onCancel={handleShareModalClose}
        onOk={handleShareSubmit}
        loading={sharing}
        shareContent={shareContent}
        setShareContent={setShareContent}
        selectedPost={selectedPost}
      />
    </div>
  );
};

export default PostUser;
