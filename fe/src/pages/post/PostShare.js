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
import CommentSection from "./CommentSection";
import { commentService } from "../../services/commentService";

const { Text, Paragraph } = Typography;

const PostShare = ({
  postShare,
  likingPosts,
  expandedComments,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
  onLike,
  onComment,
  onShare,
  onDeletePostShare,
}) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  console.log("comment",comments)

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

  // Get reaction stats từ postShare
  const getReactionStats = () => {
    if (!postShare.likes || !Array.isArray(postShare.likes)) {
      return {
        totalCount: 0,
        topReactions: [],
        currentUserReaction: postShare.reactionType || null,
        reactionCounts: {},
      };
    }

    const reactionCounts = {};
    postShare.likes.forEach((reaction) => {
      const type = reaction.reactionType || "Like";
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
    });

    const sortedReactions = Object.entries(reactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topReactions = sortedReactions
      .map(([type]) => reactionOptions.find((r) => r.type === type))
      .filter(Boolean);

    return {
      totalCount: postShare.likes.length,
      topReactions,
      currentUserReaction: postShare.reactionType || null,
      reactionCounts,
    };
  };

  const { totalCount, topReactions, currentUserReaction, reactionCounts } = getReactionStats();
  const currentReaction = reactionOptions.find((r) => r.type === currentUserReaction);
  
  // Check if the post share itself is liked, not the original post
  const isLiked = postShare.isLiked || false;
  const likeCount = totalCount;
  const commentCount = comments.length || postShare.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  console.log("postShare", postShare);

  // Create a modified postShare object with fetched comments for CommentSection
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
    <div className="reaction-box" style={{ 
      display: 'flex', 
      gap: '8px', 
      padding: '8px',
      background: 'white',
      borderRadius: '25px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {reactionOptions.map((r) => (
        <Button
          key={r.type}
          type="text"
          className="reaction-item"
          onClick={() => onLike(post.id, r.type, true, postShare.id)}
          style={{
            padding: '4px 8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '20px' }}>{r.icon}</span>
        </Button>
      ))}
    </div>
  );

  // Render reaction summary giống Facebook
  const renderReactionSummary = () => {
    if (totalCount === 0) return null;
    return (
      <div className="reaction-summary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="reaction-icons" style={{ display: 'flex' }}>
          {topReactions.map((reaction, index) => (
            <span
              key={reaction.type}
              className="reaction-icon-small"
              style={{ 
                fontSize: '16px',
                marginLeft: index > 0 ? '-4px' : '0',
                zIndex: topReactions.length - index,
                background: 'white',
                borderRadius: '50%',
                padding: '2px'
              }}
              title={`${reactionCounts[reaction.type] || 0} ${reaction.label}`}
            >
              {reaction.icon}
            </span>
          ))}
        </div>
        <span
          className="reaction-count"
          title="Xem ai đã thả cảm xúc"
          style={{ cursor: "pointer", fontSize: '13px', color: '#65676b' }}
        >
          {totalCount > 0 && (
            <>
              {Object.entries(reactionCounts).length === 1 &&
              currentUserReaction
                ? `Bạn${
                    totalCount > 1 ? ` và ${totalCount - 1} người khác` : ""
                  }`
                : `${totalCount} lượt thả cảm xúc`}
            </>
          )}
        </span>
      </div>
    );
  };

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

  return (
    <Card className="post-share-card" hoverable style={{ marginBottom: "20px" }}>
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
      <Card type="inner" className="shared-post-inner" style={{ width: "100%" }}>
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
          {post.imageUrl && (
            <div className="post-images">
              <Image
                src={post.imageUrl}
                className="post-image"
                placeholder={<div>Loading...</div>}
                onError={() => console.error("Failed to load image")}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Hiển thị reaction summary */}
      {renderReactionSummary()}

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
            {likeCount > 0 && ` (${likeCount})`}
          </Button>
        </Popover>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => onComment(post.id)}
          className={`action-button ${isCommentsExpanded ? "active" : ""}`}
          aria-label="Bình luận bài viết"
        >
          Bình luận {commentCount > 0 && `(${commentCount})`}
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
            <div style={{ textAlign: "center", padding: "20px" }}>
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
    </Card>
  );
};

export default React.memo(PostShare);
