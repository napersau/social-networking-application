import React from "react";
import {
  Card,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";

const { Text, Paragraph } = Typography;

const PostCard = ({ 
  post, 
  likingPosts, 
  expandedComments,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
  onLike,
  onComment,
  onShare
}) => {
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
          onClick={() => onLike(post.id)}
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
          onClick={() => onComment(post.id)}
          className={`action-button ${isCommentsExpanded ? "active" : ""}`}
        >
          Bình luận {commentCount > 0 && `(${commentCount})`}
        </Button>

        <Button
          type="text"
          icon={<RetweetOutlined />}
          onClick={() => onShare(post.id)}
          className="action-button"
        >
          Chia sẻ {post.shares ? `(${post.shares})` : ""}
        </Button>
      </div>

      {/* Comment Section - Only show when expanded */}
      {isCommentsExpanded && (
        <CommentSection 
          post={post}
          commentingPosts={commentingPosts}
          setCommentingPosts={setCommentingPosts}
          setPosts={setPosts}
          commentForms={commentForms}
        />
      )}
    </Card>
  );
};

export default PostCard;