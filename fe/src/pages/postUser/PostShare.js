import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
  Dropdown,
  Menu,
  message,
  Spin,
  Popover,
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
  EllipsisOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import CommentSection from "../post/CommentSection";
import { commentService } from "../../services/commentService";
import { likeService } from "../../services/likeService";
import { getMyInfo } from "../../services/userService";
import "../post/PostShare.css";

const { Text, Paragraph } = Typography;

const PostShare = ({
  postShare,
  likingPosts,
  expandedComments,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
  currentUser,
  onLike,
  onComment,
  onShare,
  onDeletePostShare,
  handleSubmitComment,
}) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localCurrentUser, setLocalCurrentUser] = useState(null);

  // Modal danh sách reactions
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [postShareLikes, setPostShareLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // Helper function để lấy images từ media array
  const getPostImages = (post) => {
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

  console.log("comment",comments)

  // Fetch current user info if not provided via props
  useEffect(() => {
    if (!currentUser) {
      const fetchCurrentUser = async () => {
        try {
          const response = await getMyInfo();
          if (response.data && response.data.code === 1000) {
            setLocalCurrentUser(response.data.result);
          }
        } catch (error) {
          console.error("Error fetching current user info:", error);
        }
      };
      fetchCurrentUser();
    }
  }, [currentUser]);

  // Function to fetch comments for this post share
  const fetchComments = async () => {
    if (commentsLoaded || loadingComments || !postShare?.id) return;

    setLoadingComments(true);
    try {
      const response = await commentService.getCommentsByPostShareId(postShare.id);
      if (response.data && response.data.code === 1000) {
        setComments(response.data.result || []);
        setCommentsLoaded(true);
      } else {
        message.error("Không thể tải bình luận!");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Đã xảy ra lỗi khi tải bình luận!");
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch comments when comment section is expanded
  useEffect(() => {
    if (expandedComments.has(postShare?.post?.id) && !commentsLoaded && postShare?.id) {
      fetchComments();
    }
  }, [expandedComments, commentsLoaded, postShare?.id, postShare?.post?.id]);

  // Fetch post share likes
  const fetchPostShareLikes = async () => {
    if (loadingLikes || !postShare?.id) return;

    setLoadingLikes(true);
    try {
      const response = await likeService.getPostShareLikes(postShare.id);
      if (response.data && response.data.code === 1000) {
        setPostShareLikes(response.data.result || []);
      } else {
        message.error("Không thể tải danh sách người thích!");
      }
    } catch (error) {
      console.error("Error fetching post share likes:", error);
      message.error("Đã xảy ra lỗi khi tải danh sách người thích!");
    } finally {
      setLoadingLikes(false);
    }
  };

  if (!postShare || !postShare.post) return null;

  const { user, sharedContent, createdAt, post } = postShare;
  const isLiking = likingPosts.has(post.id);
  
  // Reaction options giống Facebook
  const reactionOptions = [
    { type: "Like", icon: "👍", label: "Thích", color: "#1877f2" },
    { type: "Love", icon: "❤️", label: "Yêu thích", color: "#f33e58" },
    { type: "Haha", icon: "😂", label: "Haha", color: "#f7b125" },
    { type: "Wow", icon: "😮", label: "Wow", color: "#f7b125" },
    { type: "Sad", icon: "😢", label: "Buồn", color: "#f7b125" },
    { type: "Angry", icon: "😡", label: "Phẫn nộ", color: "#e9710f" },
  ];

  // Simplified stats for post share - chỉ lấy số lượng từ likesCount
  const currentUserReaction = postShare.reactionType || null;
  const currentReaction = reactionOptions.find((r) => r.type === currentUserReaction);
  
  // Check if the post share itself is liked, not the original post
  const isLiked = postShare.isLiked || false;
  const likeCount = postShare.likesCount || 0; // Sử dụng likesCount từ backend
  const commentCount = comments.length || postShare.commentsCount || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  const postShareWithComments = {
    ...postShare,
    comments: comments,
    commentCount: comments.length,
  };

  // Handle default like action
  const handleDefaultLike = () => {
    if (currentUserReaction === "Like") {
      onLike(post.id, null, true, postShare.id);
    } else {
      onLike(post.id, "Like", true, postShare.id);
    }
  };

  // Reaction picker content
  const reactionContent = (
    <div className="reaction-box">
      {reactionOptions.map((r) => (
        <Button
          key={r.type}
          type="text"
          className="reaction-item"
          onClick={() => onLike(post.id, r.type, true, postShare.id)}
        >
          <span style={{ fontSize: '20px' }}>{r.icon}</span>
        </Button>
      ))}
    </div>
  );

  // Render like count và comment count trên cùng một hàng giống Facebook
  const renderCountSummary = () => {
    const likeCount = postShare.likesCount || 0;
    const commentCount = comments.length || postShare.commentsCount || 0;
    
    if (likeCount === 0 && commentCount === 0) return null;
    
    return (
      <div className="count-summary">
        <div className="left-counts">
          {likeCount > 0 && (
            <span
              className="like-count-text"
              title="Xem ai đã thả cảm xúc"
              onClick={() => {
                setIsReactionModalVisible(true);
                fetchPostShareLikes();
              }}
            >
              {likeCount === 1 ? '1 lượt thả cảm xúc' : `${likeCount} lượt thả cảm xúc`}
            </span>
          )}
        </div>
        <div className="right-counts">
          {commentCount > 0 && (
            <span
              className="comment-count-text"
              onClick={() => onComment(post.id)}
            >
              {commentCount === 1 ? '1 bình luận' : `${commentCount} bình luận`}
            </span>
          )}
        </div>
      </div>
    );
  };

  const myId = localStorage.getItem("userId");
  const isMyPost = user.id.toString() === myId;

  const menu = (
    <Menu
      items={[
        {
          key: "edit",
          label: "Chỉnh sửa bài viết",
          onClick: () => console.log("Edit post share", postShare.id),
        },
        {
          key: "delete",
          label: <span style={{ color: "red" }}>Xóa bài viết</span>,
          onClick: () => onDeletePostShare(postShare.id),
        },
      ]}
    />
  );

  // Nhóm người theo reactionType từ postShareLikes (nếu cần thiết)
  const groupedReactions = postShareLikes.reduce((acc, like) => {
    const type = like.reactionType || "Like";
    if (!acc[type]) acc[type] = [];
    acc[type].push(like);
    return acc;
  }, {});

  const allReactions = postShareLikes; // Sử dụng trực tiếp postShareLikes

  return (
    <Card className="post-share-card" hoverable>
      {/* Header người chia sẻ */}
      <div className="post-header">
        <Avatar size={40} src={user.avatarUrl} icon={<UserOutlined />} />
        <div className="post-user-info">
          <Text strong>
            {user.firstName || "Anonymous"} {user.lastName || ""}
          </Text>
          <Text type="secondary" className="post-time">
            {createdAt
              ? format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
              : "Vừa xong"}
          </Text>
          <Text type="secondary"> đã chia sẻ một bài viết</Text>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Dropdown>
      </div>

      {/* Nội dung người share viết thêm */}
      {sharedContent && (
        <>
          <Divider className="post-divider" />
          <Paragraph>{sharedContent}</Paragraph>
        </>
      )}

      <Divider className="post-divider" />

      {/* Bài gốc */}
      <Card type="inner" className="shared-post-inner">
        <div className="post-header">
          <Avatar size={40} src={post.user.avatarUrl} icon={<UserOutlined />} />
          <div className="post-user-info">
            <Text strong>
              {post.user.firstName || "Anonymous"} {post.user.lastName || ""}
            </Text>
            <Text type="secondary" className="post-time">
              {post.createdAt
                ? format(new Date(post.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })
                : "Vừa xong"}
            </Text>
          </div>
        </div>

        <div className="post-content">
          <Paragraph>{post.content}</Paragraph>
          {(() => {
            const images = getPostImages(post);
            if (images.length === 0) return null;

            return (
              <div className="post-images">
                {images.length === 1 ? (
                  // Hiển thị 1 ảnh
                  <Image 
                    src={images[0]} 
                    className="post-image"
                    placeholder={<div>Loading...</div>}
                    onError={() => console.error("Failed to load image")}
                  />
                ) : (
                  // Hiển thị nhiều ảnh trong grid
                  <div className={`post-images-grid ${images.length > 4 ? 'grid-many' : `grid-${images.length}`}`}>
                    {images.slice(0, 5).map((imageUrl, index) => (
                      <div key={index} className="image-container">
                        <Image 
                          src={imageUrl} 
                          className="post-image-grid"
                          style={{ objectFit: 'cover' }}
                          placeholder={<div>Loading...</div>}
                          onError={() => console.error("Failed to load image")}
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
      </Card>

      {/* Hiển thị số lượng like và comment */}
      {renderCountSummary()}

      {/* Actions giống post thường */}
      <Divider className="post-divider" />

      <div className="post-actions">
        {/* Nút Reaction với Popover */}
        <Popover content={reactionContent} trigger="hover" placement="top">
          <Button
            type="text"
            loading={isLiking}
            onClick={handleDefaultLike}
            className={`action-button ${currentUserReaction ? "reacted" : ""}`}
            style={{ color: currentReaction?.color || "#65676b" }}
            icon={
              currentReaction ? (
                <span className="reaction-emoji" style={{ fontSize: '16px' }}>{currentReaction.icon}</span>
              ) : (
                <HeartOutlined />
              )
            }
            aria-label={isLiked ? "Bỏ thích bài viết" : "Thích bài viết"}
          >
            <span className={`button-text ${currentUserReaction ? "reacted" : ""}`}>
              {currentUserReaction || "Thích"}
            </span>
          </Button>
        </Popover>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => onComment(post.id)}
          className={`action-button ${isCommentsExpanded ? "active" : ""}`}
          aria-label="Bình luận bài viết"
        >
          Bình luận
        </Button>

        <Button
          type="text"
          icon={<RetweetOutlined />}
          onClick={() => onShare(post.id)}
          className="action-button"
          aria-label="Chia sẻ bài viết"
        >
          Chia sẻ {post.sharesCount ? `(${post.sharesCount})` : ""}
        </Button>
      </div>

      {isCommentsExpanded && (
        <div>
          {loadingComments ? (
            <div className="loading-comments">
              <Spin />
              <p>Đang tải bình luận...</p>
            </div>
          ) : (
            <CommentSection
              post={postShareWithComments}
              commentingPosts={commentingPosts}
              setCommentingPosts={setCommentingPosts}
              setPosts={(updateFn) => {
                // Update the local comments state
                if (typeof updateFn === "function") {
                  const updatedPosts = updateFn([postShareWithComments]);
                  if (updatedPosts[0]) {
                    setComments(updatedPosts[0].comments || []);
                  }
                }
                // Also update the main posts state if needed
                setPosts(updateFn);
              }}
              commentForms={commentForms}
            />
          )}
        </div>
      )}

      {/* Modal hiển thị danh sách reactions cho post share */}
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
              label: `Tất cả (${allReactions.length})`,
              children: (
                <List
                  dataSource={allReactions}
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
            ...Object.entries(groupedReactions).map(([type, users]) => ({
              key: type,
              label: `${type} (${users.length})`,
              children: (
                <List
                  dataSource={users}
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
                      />
                    </List.Item>
                  )}
                />
              ),
            })),
          ]}
        />
      </Modal>
    </Card>
  );
};

export default React.memo(PostShare);
