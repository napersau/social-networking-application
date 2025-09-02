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
  const isLiked = post.isLiked || false;
  const likeCount = postShare.likes?.length || 0;
  const commentCount = comments.length || postShare.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  console.log("postShare", postShare);

  // Create a modified postShare object with fetched comments for CommentSection
  const postShareWithComments = {
    ...postShare,
    comments: comments,
    commentCount: comments.length,
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

      {/* Actions giống post thường */}
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
