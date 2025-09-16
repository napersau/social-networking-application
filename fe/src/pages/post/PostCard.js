import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
  Input,
  Popover,
  List,
  Tabs,
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
  const commentCount = post.commentsCount || post.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(post.content);

  // Modal danh sách reactions
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);

  const reactionOptions = [
    { type: "Like", icon: "👍", label: "Thích", color: "#1877f2" },
    { type: "Love", icon: "❤️", label: "Yêu thích", color: "#f33e58" },
    { type: "Haha", icon: "😂", label: "Haha", color: "#f7b125" },
    { type: "Wow", icon: "😮", label: "Wow", color: "#f7b125" },
    { type: "Sad", icon: "😢", label: "Buồn", color: "#f7b125" },
    { type: "Angry", icon: "😡", label: "Phẫn nộ", color: "#e9710f" },
  ];

  const getReactionStats = () => {
    if (!post.likes || !Array.isArray(post.likes)) {
      return {
        totalCount: 0,
        topReactions: [],
        currentUserReaction: post.reactionType || null, // lấy trực tiếp từ backend
        reactionCounts: {},
      };
    }

    const reactionCounts = {};
    post.likes.forEach((reaction) => {
      const type = reaction.reactionType || "Like";
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
    });

    const sortedReactions = Object.entries(reactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topReactions = sortedReactions
      .map(([type]) => reactionOptions.find((r) => r.type === type))
      .filter(Boolean);

    const totalCount = post.likes.length;

    return {
      totalCount,
      topReactions,
      currentUserReaction: post.reactionType || null, // lấy thẳng từ backend
      reactionCounts,
    };
  };

  const { totalCount, topReactions, currentUserReaction, reactionCounts } =
    getReactionStats();
  const currentReaction = reactionOptions.find(
    (r) => r.type === currentUserReaction
  );

  const handleDefaultLike = () => {
    if (currentUserReaction === "Like") {
      onLike(post.id, null);
    } else {
      onLike(post.id, "Like");
    }
  };

  // Box hiển thị reactions khi hover
  const reactionContent = (
    <div className="reaction-box">
      {reactionOptions.map((r) => (
        <Button
          key={r.type}
          type="text"
          className="reaction-item"
          onClick={() => onLike(post.id, r.type)}
        >
          <span className="reaction-emoji">{r.icon}</span>
        </Button>
      ))}
    </div>
  );

  // Render like count và comment count trên cùng một hàng giống Facebook
  const renderCountSummary = () => {
    const likeCount = totalCount;
    const commentCount = post.commentsCount || post.comments?.length || 0;
    
    if (likeCount === 0 && commentCount === 0) return null;
    
    return (
      <div className="count-summary">
        <div className="left-counts">
          {likeCount > 0 && (
            <span
              className="like-count-text"
              title="Xem ai đã thả cảm xúc"
              onClick={() => setIsReactionModalVisible(true)}
            >
              {Object.entries(reactionCounts).length === 1 && currentUserReaction
                ? `Bạn${totalCount > 1 ? ` và ${totalCount - 1} người khác` : ""}`
                : `${totalCount} lượt thả cảm xúc`}
            </span>
          )}
        </div>
        <div className="right-counts">
          {commentCount > 0 && (
            <span
              className="comment-count-text"
              onClick={handleToggleComments}
            >
              {commentCount === 1 ? '1 bình luận' : `${commentCount} bình luận`}
            </span>
          )}
        </div>
      </div>
    );
  };

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

  // Nhóm người theo reactionType
  const groupedReactions =
    post.likes?.reduce((acc, r) => {
      const type = r.reactionType || "Like";
      if (!acc[type]) acc[type] = [];
      acc[type].push(r);
      return acc;
    }, {}) || {};

  const allReactions = Object.values(groupedReactions).flat();

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
            <Button
              icon={<MoreOutlined />}
              onClick={() =>
                Modal.info({
                  title: "Tùy chọn",
                  content: (
                    <div>
                      <Button
                        type="text"
                        onClick={() => {
                          setEditingContent(post.content);
                          setIsEditModalVisible(true);
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        type="text"
                        danger
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Xoá bài viết
                      </Button>
                    </div>
                  ),
                })
              }
            />
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

        {/* Hiển thị số lượng like và comment trên cùng một hàng */}
        {renderCountSummary()}

        <Divider className="post-divider" />
        <div className="post-actions">
          {/* Nút Reaction */}
          <Popover content={reactionContent} trigger="hover" placement="top">
            <Button
              type="text"
              loading={isLiking}
              onClick={handleDefaultLike}
              className={`action-button ${
                currentUserReaction ? "reacted" : ""
              }`}
              style={{ color: currentReaction?.color || "#65676b" }}
              icon={
                currentReaction ? (
                  <span className="reaction-emoji">{currentReaction.icon}</span>
                ) : (
                  <HeartOutlined />
                )
              }
            >
              <span
                className={`button-text ${
                  currentUserReaction ? "reacted" : ""
                }`}
              >
                {currentUserReaction || "Thích"}
              </span>
            </Button>
          </Popover>

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

      {/* Modal hiển thị danh sách reactions */}
      <Modal
        title="Người đã thả cảm xúc"
        open={isReactionModalVisible}
        onCancel={() => setIsReactionModalVisible(false)}
        footer={null}
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
    </>
  );
};

export default PostCard;
