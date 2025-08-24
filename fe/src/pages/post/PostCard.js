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
  const commentCount = post.commentCount || post.comments?.length || 0;
  const isCommentsExpanded = expandedComments.has(post.id);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(post.content);

  const reactionOptions = [
    { type: "Like", icon: "👍", label: "Thích", color: "#1877f2" },
    { type: "Love", icon: "❤️", label: "Yêu thích", color: "#f33e58" },
    { type: "Haha", icon: "😂", label: "Haha", color: "#f7b125" },
    { type: "Wow", icon: "😮", label: "Wow", color: "#f7b125" },
    { type: "Sad", icon: "😢", label: "Buồn", color: "#f7b125" },
    { type: "Angry", icon: "😡", label: "Phẫn nộ", color: "#e9710f" },
  ];

  // Tính toán reactions giống Facebook - Support nhiều format dữ liệu
  const getReactionStats = () => {
    // Debug: Log dữ liệu để kiểm tra
    console.log('Post data:', {
      reactions: post.reactions,
      likes: post.likes,
      reactionType: post.reactionType,
      postId: post.id
    });

    // Xử lý format cũ (post.reactionType và post.likes)
    if (post.reactionType && !post.reactions) {
      const currentUserReaction = post.reactionType;
      const likeCount = post.likes?.length || 0;
      
      const topReactions = [reactionOptions.find(r => r.type === currentUserReaction)].filter(Boolean);
      
      return {
        totalCount: likeCount,
        topReactions: topReactions,
        currentUserReaction: currentUserReaction,
        reactionCounts: { [currentUserReaction]: likeCount }
      };
    }

    // Xử lý format mới (post.reactions array)
    if (!post.reactions || !Array.isArray(post.reactions)) {
      // Fallback: sử dụng post.likes nếu có
      const likeCount = post.likes?.length || 0;
      if (likeCount > 0) {
        return {
          totalCount: likeCount,
          topReactions: [reactionOptions.find(r => r.type === 'Like')].filter(Boolean),
          currentUserReaction: post.reactionType || null,
          reactionCounts: { 'Like': likeCount }
        };
      }
      
      return {
        totalCount: 0,
        topReactions: [],
        currentUserReaction: null,
        reactionCounts: {}
      };
    }

    // Đếm từng loại reaction
    const reactionCounts = {};
    let currentUserReaction = null;
    
    post.reactions.forEach(reaction => {
      const type = reaction.type || reaction.reactionType || 'Like';
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
      
      // Kiểm tra user hiện tại (có thể dùng nhiều field khác nhau)
      const userId = reaction.userId || reaction.user_id || reaction.id;
      const currentUserId = post.currentUserId || post.currentUser?.id;
      
      if (userId === currentUserId) {
        currentUserReaction = type;
      }
    });

    // Sắp xếp reactions theo số lượng (giảm dần)
    const sortedReactions = Object.entries(reactionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Chỉ lấy top 3

    const topReactions = sortedReactions.map(([type]) => 
      reactionOptions.find(r => r.type === type)
    ).filter(Boolean);

    const totalCount = post.reactions.length;

    return {
      totalCount,
      topReactions,
      currentUserReaction: currentUserReaction || post.reactionType,
      reactionCounts
    };
  };

  const { totalCount, topReactions, currentUserReaction, reactionCounts } = getReactionStats();
  const currentReaction = reactionOptions.find(r => r.type === currentUserReaction);

  // Click nút Like mặc định
  const handleDefaultLike = () => {
    if (currentUserReaction === "Like") {
      onLike(post.id, null); // bỏ Like
    } else {
      onLike(post.id, "Like"); // mặc định Like
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

  // Render reaction summary giống Facebook - Luôn hiển thị nếu có reactions
  const renderReactionSummary = () => {
    if (totalCount === 0) return null;

    return (
      <div className="reaction-summary">
        <div className="reaction-icons">
          {topReactions.map((reaction, index) => (
            <span 
              key={reaction.type} 
              className="reaction-icon-small" 
              style={{zIndex: topReactions.length - index}}
              title={`${reactionCounts[reaction.type] || 0} ${reaction.label}`}
            >
              {reaction.icon}
            </span>
          ))}
        </div>
        <span className="reaction-count" title="Xem ai đã thả cảm xúc">
          {totalCount > 0 && (
            <>
              {Object.entries(reactionCounts).length === 1 && currentUserReaction 
                ? `Bạn${totalCount > 1 ? ` và ${totalCount - 1} người khác` : ''}`
                : `${totalCount} ${totalCount === 1 ? 'lượt thả cảm xúc' : 'lượt thả cảm xúc'}`
              }
            </>
          )}
        </span>
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

        {/* Hiển thị reaction summary giống Facebook */}
        {renderReactionSummary()}

        <Divider className="post-divider" />

        <div className="post-actions">
          {/* Nút Reaction */}
          <Popover content={reactionContent} trigger="hover" placement="top">
            <Button
              type="text"
              loading={isLiking}
              onClick={handleDefaultLike}
              className={`action-button ${currentUserReaction ? "reacted" : ""}`}
              style={{ color: currentReaction?.color || "#65676b" }}
              icon={
                currentReaction ? (
                  <span className="reaction-emoji">{currentReaction.icon}</span>
                ) : (
                  <HeartOutlined />
                )
              }
            >
              <span className={`button-text ${currentUserReaction ? "reacted" : ""}`}>
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