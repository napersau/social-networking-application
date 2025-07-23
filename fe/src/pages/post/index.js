import React, { useState, useEffect } from "react";
import { Form, List, message, Spin, Row, Col } from "antd";
import { postService } from "../../services/postService";
import { likeService } from "../../services/likeService";
import { getPostShares } from "../../services/postShareService";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import CreatePostButton from "./CreatePostButton";
import EmptyPosts from "./EmptyPosts";
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
                    />
                  ) : (
                    <PostCard
                      post={item}
                      likingPosts={likingPosts}
                      expandedComments={expandedComments}
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
