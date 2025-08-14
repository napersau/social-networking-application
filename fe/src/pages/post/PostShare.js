import React from "react";
import { Card, Button, Avatar, Divider, Typography, Image, Dropdown, Menu } from "antd";
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
  if (!postShare || !postShare.post) return null;

  const { user, sharedContent, createdAt, post } = postShare;
  const isLiking = likingPosts.has(post.id);
  const isLiked = post.isLiked || false;
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  const menu = (
    <Menu
      items={[
        {
          key: "edit",
          label: "Chỉnh sửa bài viết",
          onClick: () => {
            // Tính năng chỉnh sửa sẽ làm sau
            console.log("Edit post share", postShare.id);
          },
        },
        {
          key: "delete",
          label: <span style={{ color: "red" }}>Xóa bài viết</span>,
          onClick: () => {
            onDeletePostShare(postShare.id);
          },
        },
      ]}
    />
  );

  return (
    <Card className="post-card" hoverable style={{ marginBottom: "20px" }}>
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

      {sharedContent && (
        <>
          <Divider className="post-divider" />
          <Paragraph>{sharedContent}</Paragraph>
        </>
      )}

      <Divider className="post-divider" />

      {/* Original Post */}
      <Card type="inner" className="post-card">
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

        <Divider className="post-divider" />

        <div className="post-actions">
          <Button
            type="text"
            icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
            onClick={() => onLike(post.id)}
            loading={isLiking}
            className={`action-button ${isLiked ? "liked" : ""}`}
            style={{ color: isLiked ? "#ff4d4f" : undefined }}
            aria-label={isLiked ? "Bỏ thích bài viết" : "Thích bài viết"}
          >
            {isLiked ? "Đã thích" : "Thích"} {likeCount > 0 && `(${likeCount})`}
          </Button>

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
          <CommentSection
            post={post}
            commentingPosts={commentingPosts}
            setCommentingPosts={setCommentingPosts}
            setPosts={setPosts}
            commentForms={commentForms}
          />
        )}
      </Card>
    </Card>
  );
};

export default React.memo(PostShare);
