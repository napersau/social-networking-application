import React, { useState } from "react";
import {
  Card,
  message,
  Dropdown,
  Modal,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
  Input,
} from "antd";
import {
  HeartOutlined,
  MoreOutlined,
  CommentOutlined,
  RetweetOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";
import { commentService } from "../../services/commentService";
import { postService } from "../../services/postService";
import "./PostCard.css";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(post.content);
  const reactionOptions = [
    {
      type: "Like",
      icon: (
        <span className="reaction-emoji">👍</span>
      ),
      label: "Thích",
      color: "#1890ff",
    },
    {
      type: "Love",
      icon: (
        <span className="reaction-emoji">❤️</span>
      ),
      label: "Yêu thích",
      color: "#ff4757",
    },
    {
      type: "Haha",
      icon: (
        <span className="reaction-emoji">😂</span>
      ),
      label: "Haha",
      color: "#ffa502",
    },
    {
      type: "Wow",
      icon: (
        <span className="reaction-emoji">😮</span>
      ),
      label: "Wow",
      color: "#5f27cd",
    },
    {
      type: "Sad",
      icon: (
        <span className="reaction-emoji">😢</span>
      ),
      label: "Buồn",
      color: "#74b9ff",
    },
    {
      type: "Angry",
      icon: (
        <span className="reaction-emoji">😡</span>
      ),
      label: "Phẫn nộ",
      color: "#fd79a8",
    },
  ];
  console.log("post", post)
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
            message.error("Xoá bài viết thất bại");
          }
        } catch (error) {
          console.error("Lỗi khi xoá bài viết:", error);
          message.error("Đã xảy ra lỗi");
        }
      },
    });
  };

  const handleEditPost = async () => {
    try {
      const response = await postService.updatePost(post.id, {
        content: editingContent,
      });
      if (response.data?.code === 1000) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id ? { ...p, content: editingContent } : p
          )
        );
        message.success("Đã cập nhật bài viết");
        setIsEditModalVisible(false);
      } else {
        message.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      message.error("Đã xảy ra lỗi");
    }
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
        message.error("Đã xảy ra lỗi");
      }
    }
  };

  return (
    <>
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
                    key: "edit",
                    label: "Chỉnh sửa bài viết",
                    onClick: () => {
                      setEditingContent(post.content);
                      setIsEditModalVisible(true);
                    },
                  },
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
          <Dropdown
            trigger={["click"]}
            className="reaction-dropdown"
            menu={{
              items: reactionOptions.map((r) => ({
                key: r.type,
                icon: r.icon,
                label: (
                  <span style={{ 
                    color: r.color, 
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {r.label}
                  </span>
                ),
                onClick: () => onLike(post.id, r.type),
                className: "reaction-item",
              })),
            }}
            overlayStyle={{
              borderRadius: "12px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Button
              type="text"
              icon={
                reactionOptions.find((r) => r.type === post.reactionType)
                  ?.icon || <HeartOutlined />
              }
              loading={isLiking}
              className={`action-button ${post.reactionType ? "liked" : ""}`}
              style={{ 
                color: post.reactionType 
                  ? reactionOptions.find((r) => r.type === post.reactionType)?.color
                  : undefined,
              }}
            >
              <span className={`button-text ${post.reactionType ? "reacted" : ""}`}>
                {post.reactionType || "Thích"} {likeCount > 0 && `(${likeCount})`}
              </span>
            </Button>
          </Dropdown>

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

      {/* Modal chỉnh sửa bài viết */}
      <Modal
        title="Chỉnh sửa bài viết"
        open={isEditModalVisible}
        onOk={handleEditPost}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <TextArea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          rows={5}
          maxLength={1000}
        />
      </Modal>
    </>
  );
};

export default PostCard;
