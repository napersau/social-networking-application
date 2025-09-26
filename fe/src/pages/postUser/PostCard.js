import React, { useState } from "react";
import {
  Card,
  message,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
  Modal,
  List,
  Tabs,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";
import { commentService } from "../../services/commentService";
import { createPostShare } from "../../services/postShareService";
import { likeService } from "../../services/likeService";
import "./styles.css";

const { Text, Paragraph } = Typography;

const PostCard = ({
  post,
  likingPosts,
  expandedComments,
  setExpandedComments,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
  currentUser,
  onLike,
}) => {
  const isLiking = likingPosts.has(post.id);
  const isLiked = post.isLiked || false;
  const likeCount = post.likes?.length || 0;
  const commentCount = post.commentsCount || post.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);
  
  // Modal danh sách reactions
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [postLikes, setPostLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // Function để fetch likes của post
  const fetchPostLikes = async () => {
    if (loadingLikes || !post?.id) return;

    setLoadingLikes(true);
    try {
      // Sửa: Gọi đúng method getLikesByPostId thay vì getPostLikes
      const response = await likeService.getPostLikes(post.id);
      if (response.data && response.data.code === 1000) {
        setPostLikes(response.data.result || []);
      } else {
        message.error("Không thể tải danh sách người thích!");
      }
    } catch (error) {
      console.error("Error fetching post likes:", error);
      message.error("Đã xảy ra lỗi khi tải danh sách người thích!");
    } finally {
      setLoadingLikes(false);
    }
  };

  // Helper function để lấy images từ media array
  const getPostImages = () => {
    // Chỉ sử dụng media array
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      // Lọc chỉ lấy media type là image
      const imageUrls = post.media
        .filter(media => {
          const isImage = (media.mediaType === 'IMAGE' || media.type === 'image') && (media.mediaUrl || media.url);
          return isImage;
        })
        .map(media => media.mediaUrl || media.url);
      
      return imageUrls;
    }
    
    return [];
  };

  // Render like count và comment count trên cùng một hàng giống Facebook
  const renderCountSummary = () => {
    if (likeCount === 0 && commentCount === 0) return null;
    
    return (
      <div className="count-summary" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        fontSize: '13px',
        color: '#65676b'
      }}>
        <div className="left-counts">
          {likeCount > 0 && (
            <span
              className="like-count-text"
              style={{ cursor: 'pointer' }}
              title="Xem ai đã thả cảm xúc"
              onClick={() => {
                setIsReactionModalVisible(true);
                fetchPostLikes();
              }}
            >
              {likeCount} lượt thả cảm xúc
            </span>
          )}
        </div>
        <div className="right-counts">
          {commentCount > 0 && (
            <span
              className="comment-count-text"
              style={{ cursor: 'pointer' }}
              onClick={handleToggleComments}
            >
              {commentCount === 1 ? '1 bình luận' : `${commentCount} bình luận`}
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleToggleComments = async () => {
    if (isCommentsExpanded) {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    } else {
      try {
        const response = await commentService.getCommentsByPostId(post.id);
        if (response.data?.code === 1000) {
          const fetchedComments = response.data.result;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === post.id ? { ...p, comments: fetchedComments } : p
            )
          );
          setExpandedComments((prev) => new Set(prev).add(post.id));
        } else {
          message.error("Không thể tải bình luận");
        }
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
        message.error("Lỗi khi tải bình luận");
      }
    }
  };

  const handleShare = async () => {
    try {
      const res = await createPostShare({
        postId: post.id,
        sharedContent: "", // Có thể mở modal cho người dùng nhập nội dung
      });
      if (res.data?.code === 1000) {
        message.success("Chia sẻ bài viết thành công!");
        // Cập nhật số lượng chia sẻ ngay
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, shares: (p.shares || 0) + 1 }
              : p
          )
        );
      } else {
        message.error("Chia sẻ thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ bài viết:", error);
      message.error("Đã xảy ra lỗi khi chia sẻ!");
    }
  };

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
        {(() => {
          const images = getPostImages();
          if (images.length === 0) return null;

          return (
            <div className="post-images">
              {images.length === 1 ? (
                // Hiển thị 1 ảnh
                <Image src={images[0]} className="post-image" />
              ) : (
                // Hiển thị nhiều ảnh trong grid
                <div className={`post-images-grid ${images.length > 4 ? 'grid-many' : `grid-${images.length}`}`}>
                  {images.slice(0, 5).map((imageUrl, index) => (
                    <div key={index} className="image-container">
                      <Image 
                        src={imageUrl} 
                        className="post-image-grid"
                        style={{ objectFit: 'cover' }}
                      />
                      {/* Hiển thị overlay "+X" nếu có nhiều hơn 5 ảnh */}
                      {index === 4 && images.length > 5 && (
                        <div className="more-images-overlay">
                          +{images.length - 5}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Hiển thị số lượng like và comment */}
      {renderCountSummary()}

      <Divider className="post-divider" />

      <div className="post-actions">
        <Button
          type="text"
          icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
          onClick={() => onLike(post.id)}
          loading={isLiking}
          className={`action-button ${isLiked ? "liked" : ""}`}
          style={{ color: isLiked ? "#ff4d4f" : undefined }}
        >
          {isLiked ? "Đã thích" : "Thích"}
        </Button>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={handleToggleComments}
          className={`action-button ${isCommentsExpanded ? "active" : ""}`}
        >
          Bình luận
        </Button>

        <Button
          type="text"
          icon={<RetweetOutlined />}
          onClick={handleShare}
          className="action-button"
        >
          Chia sẻ {post.shares ? `(${post.shares})` : ""}
        </Button>
      </div>

      {isCommentsExpanded && (
        <CommentSection
          post={post}
          commentingPosts={commentingPosts}
          setCommentingPosts={setCommentingPosts}
          setPosts={setPosts}
          commentForms={commentForms}
          currentUser={currentUser}
        />
      )}

      {/* Modal hiển thị danh sách reactions */}
      <Modal
        title="Người đã thả cảm xúc"
        open={isReactionModalVisible}
        onCancel={() => setIsReactionModalVisible(false)}
        footer={null}
        loading={loadingLikes}
      >
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: `Tất cả (${postLikes.length})`,
              children: (
                <List
                  dataSource={postLikes}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src={item.user?.avatarUrl}>
                            {item.user?.firstName?.[0]}
                          </Avatar>
                        }
                        title={`${item.user?.firstName || ""} ${
                          item.user?.lastName || ""
                        }`}
                        description={item.reactionType}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Modal>
    </Card>
  );
};

export default PostCard;
