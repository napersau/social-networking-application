import React from "react";
import {
  Card,
  message,
  Dropdown,
  Menu,
  Modal,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
} from "antd";
import {
  HeartOutlined,
  MoreOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";
import { commentService } from "../../services/commentService"; // thêm import
import { postService } from "../../services/postService";
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
  onLike,
  onShare,
}) => {
  const isLiking = likingPosts.has(post.id);
  const isLiked = post.isLiked || false;
  const likeCount = post.likes?.length || 0;
  const commentCount = post.commentCount || post.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  const handleDeletePost = (postId) => {
    Modal.confirm({
      title: "Xác nhận xoá bài viết",
      content: "Bạn có chắc muốn xoá bài viết này không?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await postService.deletePost(postId);
          if (response.data?.code === 1000) {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            message.success("Đã xoá bài viết thành công");
          } else {
            console.error("Xoá thất bại");
          }
        } catch (error) {
          console.error("Lỗi khi xoá bài viết:", error);
        }
      },
    });
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
          console.error("Không thể tải bình luận");
        }
      } catch (err) {
        console.error("Lỗi khi tải bình luận:", err);
      }
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
        <div style={{ marginLeft: "auto" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "delete",
                  danger: true,
                  label: "Xoá bài viết",
                  onClick: () => handleDeletePost(post.id),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
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
          style={{ color: isLiked ? "#ff4d4f" : undefined }}
        >
          {isLiked ? "Đã thích" : "Thích"} {likeCount > 0 && `(${likeCount})`}
        </Button>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={handleToggleComments}
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
