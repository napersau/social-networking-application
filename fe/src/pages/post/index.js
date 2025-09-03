import React, { useState, useEffect } from "react";
import { Form, List, message, Row, Col } from "antd";
import { postService } from "../../services/postService";
import { likeService } from "../../services/likeService";
import { getPostShares, deletePostShare } from "../../services/postShareService";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import CreatePostButton from "./CreatePostButton";
import PostShare from "./PostShare";
import "./styles.css";

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [commentingPosts, setCommentingPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
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
      const [postsRes, sharesRes] = await Promise.all([
        postService.getPosts(),
        getPostShares(),
      ]);

      const normalPosts = postsRes.data?.result || [];
      const sharedPosts = sharesRes.data?.result || [];

      // Đánh dấu shared post để render đúng component (PostShare)
      const mappedSharedPosts = sharedPosts.map((share) => ({
        ...share,
        isShared: true,
        // Ensure likes property exists
        likes: share.likes || [],
        // Ensure isLiked property exists
        isLiked: share.isLiked || false,
      }));

      const combined = [...normalPosts, ...mappedSharedPosts];

      // Sắp xếp theo thời gian mới nhất
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(combined);
    } catch (error) {
      message.error("Không thể tải danh sách bài viết");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, reactionType = "Like", isPostShare = false, postShareId = null) => {
    if (likingPosts.has(postId)) return;

    console.log("handleLike called with:", { postId, reactionType, isPostShare, postShareId }); // Debug log

    setLikingPosts((prev) => new Set(prev).add(postId));
    try {
      let response;
      
      if (isPostShare && postShareId) {
        // Call API for post share
        console.log("Calling likePostShare API");
        response = await likeService.likePostShare({
          postShareId: postShareId,
          reactionType: reactionType
        });
      } else {
        // Call API for regular post
        console.log("Calling likePost API");
        response = await likeService.likePost(postId, reactionType);
      }

      if (response.data && response.data.code === 1000) {
        console.log("Like response:", response.data); // Debug log
        
        setPosts((prevPosts) => {
          try {
            return prevPosts.map((post) => {
              if (isPostShare && postShareId && post.id === postShareId) {
                // Update post share - so sánh với postShareId
                console.log("Updating post share:", post.id, "with result:", response.data.result);
                return {
                  ...post,
                  likes: response.data.result?.likes || post.likes || [],
                  isLiked: response.data.result?.isLiked !== undefined ? response.data.result.isLiked : (post.isLiked || false),
                  reactionType: response.data.result?.reactionType || post.reactionType
                };
              } else if (!isPostShare && post.id === postId) {
                // Update regular post
                console.log("Updating regular post:", post.id, "with result:", response.data.result);
                return {
                  ...post,
                  reactionType,
                  likes: response.data.result?.likes || post.likes || 0,
                  isLiked: response.data.result?.isLiked !== undefined ? response.data.result.isLiked : (post.isLiked || false)
                };
              }
              return post;
            });
          } catch (mapError) {
            console.error("Error in setPosts map function:", mapError);
            return prevPosts; // Return unchanged if there's an error
          }
        });
        
        const isLiked = response.data.result?.isLiked;
        if (isLiked !== undefined) {
          message.success(isLiked ? `Bạn đã thích bài viết` : `Bạn đã bỏ thích bài viết`);
        } else {
          message.success(`Đã cập nhật cảm xúc: ${reactionType}`);
        }
      } else {
        message.warning("Không thể thực hiện hành động này!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi cảm xúc:", error);
      message.error("Đã xảy ra lỗi khi gửi cảm xúc!");
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
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleShare = (postId) => {
    message.info("Tính năng chia sẻ đang phát triển");
  };

  // ✅ Hàm xóa bài viết share
  const handleDeletePostShare = async (shareId) => {
    try {
      await deletePostShare(shareId);
      setPosts((prev) => prev.filter((p) => p.id !== shareId));
      message.success("Đã xóa bài viết chia sẻ");
    } catch (error) {
      console.error("Lỗi khi xóa bài viết share:", error);
      message.error("Không thể xóa bài viết chia sẻ");
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Row gutter={[16, 16]} justify="center">
          <Col span={16}>
            {/* Create Post Section */}
            <CreatePostButton
              userAvatar={posts[0]?.user?.avatarUrl}
              onClick={() => setIsModalVisible(true)}
            />
            {/* Posts List */}
            <List
              dataSource={posts}
              renderItem={(item) => (
                <List.Item key={item.id} className="post-list-item">
                  {item.post ? (
                    <PostShare
                      postShare={item}
                      likingPosts={likingPosts}
                      expandedComments={expandedComments}
                      commentingPosts={commentingPosts}
                      setCommentingPosts={setCommentingPosts}
                      setPosts={setPosts}
                      commentForms={commentForms}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onDeletePostShare={handleDeletePostShare} // ✅ Truyền hàm xóa xuống
                    />
                  ) : (
                    <PostCard
                      post={item}
                      likingPosts={likingPosts}
                      expandedComments={expandedComments}
                      setExpandedComments={setExpandedComments}
                      commentingPosts={commentingPosts}
                      setCommentingPosts={setCommentingPosts}
                      setPosts={setPosts}
                      commentForms={commentForms}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  )}
                </List.Item>
              )}
              split={false}
            />
          </Col>
        </Row>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isVisible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        createLoading={createLoading}
        setCreateLoading={setCreateLoading}
        form={form}
        fileList={fileList}
        setFileList={setFileList}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        onPostCreated={fetchPosts}
      />
    </div>
  );
};

export default PostPage;
