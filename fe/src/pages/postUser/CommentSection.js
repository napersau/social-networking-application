import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Space,
  Typography,
  message,
  Divider,
  Modal,
  Dropdown,
  Menu,
} from "antd";
import {
  MoreOutlined,
  UserOutlined,
  SendOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { commentService } from "../../services/commentService";
import { likeService } from "../../services/likeService";
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const CommentSection = ({
  post,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
}) => {
  const isCommenting = commentingPosts.has(post.id);
  const comments = post.comments || [];
  const commentCount = post.commentCount || comments.length;
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // Quản lý trạng thái mở rộng replies
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());

  // Xây dựng cây comment từ danh sách phẳng
  const buildCommentTree = (flatComments) => {
    const commentMap = new Map();
    const rootComments = [];

    flatComments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    flatComments.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  const nestedComments = buildCommentTree(comments);

  // Toggle mở rộng replies
  const toggleExpandReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = async (postId, content) => {
    if (!content.trim()) {
      message.warning("Vui lòng nhập nội dung bình luận!");
      return;
    }

    if (commentingPosts.has(postId)) {
      return;
    }

    setCommentingPosts((prev) => new Set(prev).add(postId));

    try {
      const response = await commentService.createComment(
        postId,
        content.trim()
      );

      if (response.data && response.data.code === 1000) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const newComment = response.data.result;
              return {
                ...post,
                comments: [...(post.comments || []), newComment],
                commentCount: (post.commentCount || 0) + 1,
              };
            }
            return post;
          })
        );

        commentForms.resetFields([`comment_${postId}`]);
        message.success("Đã gửi bình luận!");
      } else {
        message.error("Không thể gửi bình luận!");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      message.error("Đã xảy ra lỗi khi gửi bình luận!");
    } finally {
      setCommentingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleReplyComment = async (postId, commentId, content) => {
    if (!content.trim()) {
      message.warning("Vui lòng nhập nội dung trả lời!");
      return;
    }

    try {
      const response = await commentService.replyComment(
        postId,
        commentId,
        content.trim()
      );

      if (response.data && response.data.code === 1000) {
        const newReply = response.data.result;

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...(post.comments || []), newReply],
                commentCount: (post.commentCount || 0) + 1,
              };
            }
            return post;
          })
        );

        // Tự động mở rộng replies khi có reply mới
        setExpandedReplies((prev) => new Set(prev).add(commentId));
        setReplyingCommentId(null);
        setReplyContent("");
        message.success("Đã trả lời bình luận!");
      } else {
        message.error("Không thể gửi trả lời!");
      }
    } catch (err) {
      console.error("Lỗi gửi trả lời:", err);
      message.error("Đã xảy ra lỗi khi gửi trả lời!");
    }
  };

  const handleUpdateComment = async (commentId, postId) => {
    if (!editedContent.trim()) {
      message.warning("Nội dung không được để trống!");
      return;
    }

    try {
      const response = await commentService.updateComment(
        commentId,
        editedContent.trim()
      );

      if (response.data && response.data.code === 1000) {
        const updatedComment = response.data.result;

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const updatedComments = post.comments.map((c) =>
                c.id === commentId
                  ? { ...c, content: updatedComment.content }
                  : c
              );
              return {
                ...post,
                comments: updatedComments,
              };
            }
            return post;
          })
        );

        message.success("Đã cập nhật bình luận!");
        setEditingCommentId(null);
      } else {
        message.error("Không thể cập nhật bình luận!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật bình luận:", error);
      message.error("Đã xảy ra lỗi khi cập nhật bình luận!");
    }
  };

  const confirmDeleteComment = (commentId, postId) => {
    Modal.confirm({
      title: "Xác nhận xóa bình luận",
      content: "Bạn có chắc muốn xóa bình luận này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDeleteComment(commentId, postId),
    });
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      const response = await commentService.deleteComment(commentId);
      if (response.data && response.data.code === 1000) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const updatedComments = post.comments?.filter(
                (c) => c.id !== commentId && c.parentCommentId !== commentId
              );
              return {
                ...post,
                comments: updatedComments,
                commentCount: Math.max((post.commentCount || 1) - 1, 0),
              };
            }
            return post;
          })
        );
        message.success("Đã xóa bình luận!");
      } else {
        message.error("Không thể xóa bình luận!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa bình luận:", err);
      message.error("Đã xảy ra lỗi khi xóa bình luận!");
    }
  };

  const handleToggleLikeComment = async (commentId) => {
    try {
      const response = await likeService.toggleLikeComment({
        cmtId: commentId,
        reactionType: "Like",
      });

      if (response.data && response.data.code === 1000) {

        const result = response.data.result;
        console.log("result", result)
        setPosts((prevPosts) =>
          prevPosts.map((postItem) => {
            if (postItem.id === post.id) {
              const updatedComments = postItem.comments.map((c) => {
                console.log("cmt",c)
                if (c.id === commentId) {
                  if (result) {
                    return {
                      ...c,
                      isLiked: true,
                      likeCount: result.likeCount,
                    };
                  } else {
                    return {
                      ...c,
                      isLiked: false,
                      likeCount: Math.max((c.likes?.length || 1000) - 1, 0),
                    };
                  }
                }
                return c;
              });
              return { ...postItem, comments: updatedComments };
            }
            return postItem;
          })
        );

        // Cập nhật state local
        setLikedCommentIds((prev) => {
          const newSet = new Set(prev);
          result ? newSet.add(commentId) : newSet.delete(commentId);
          return newSet;
        });
      } else {
        message.error("Không thể like bình luận!");
      }
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
      message.error("Đã xảy ra lỗi khi like bình luận!");
    }
  };

  const renderComment = (comment, level = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div
        key={comment.id}
        className={`comment-wrapper ${level === 0 ? "comment-root" : ""}`}
      >
        <div
          className="comment-item"
          style={{
            marginLeft: level * 32,
            position: "relative",
          }}
        >
          <div className="comment-content">
            <Avatar
              size={32}
              src={comment.user?.avatarUrl}
              icon={<UserOutlined />}
            />
            <div className="comment-bubble">
              <div className="comment-header">
                <Text strong>
                  {comment.user?.firstName || "Anonymous"}{" "}
                  {comment.user?.lastName || ""}
                </Text>
                <Text type="secondary" className="comment-time">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleString("vi-VN")
                    : "Vừa xong"}
                </Text>
              </div>

              {editingCommentId === comment.id ? (
                <div>
                  <TextArea
                    rows={2}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleUpdateComment(comment.id, post.id)}
                    >
                      Lưu
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setEditingCommentId(null)}
                    >
                      Hủy
                    </Button>
                  </Space>
                </div>
              ) : (
                <>
                  <Paragraph className="comment-text">
                    {comment.content}
                  </Paragraph>

                  <div className="comment-actions">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleToggleLikeComment(comment.id)}
                    >
                      {comment.isLiked ? "Bỏ thích" : "Thích"} (
                      {comment.likes?.length || 0})
                    </Button>

                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        replyingCommentId === comment.id
                          ? setReplyingCommentId(null)
                          : setReplyingCommentId(comment.id)
                      }
                    >
                      {replyingCommentId === comment.id ? "Hủy" : "Trả lời"}
                    </Button>

                    {/* Nút xem replies */}
                    {hasReplies && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => toggleExpandReplies(comment.id)}
                        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                        style={{ marginLeft: 8 }}
                      >
                        {isExpanded
                          ? "Ẩn phản hồi"
                          : `Xem ${comment.replies.length} phản hồi`}
                      </Button>
                    )}
                  </div>

                  {replyingCommentId === comment.id && (
                    <div style={{ marginTop: 8 }}>
                      <TextArea
                        rows={2}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập nội dung trả lời..."
                        style={{ marginBottom: 8 }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={() =>
                          handleReplyComment(post.id, comment.id, replyContent)
                        }
                      >
                        Gửi trả lời
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {(currentUserId === comment.user?.id ||
              currentUserId === post.user.id) && (
              <Dropdown
                overlay={
                  <Menu>
                    {currentUserId === comment.user?.id && (
                      <Menu.Item
                        key="edit"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditedContent(comment.content);
                        }}
                      >
                        Sửa
                      </Menu.Item>
                    )}
                    <Menu.Item
                      key="delete"
                      danger
                      onClick={() => confirmDeleteComment(comment.id, post.id)}
                    >
                      Xóa
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </div>
        </div>

        {/* Render replies nếu được mở rộng */}
        {hasReplies && isExpanded && (
          <div className="comment-replies">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-section">
      <Divider className="comment-divider" />
      <Form
        form={commentForms}
        onFinish={(values) =>
          handleSubmitComment(post.id, values[`comment_${post.id}`])
        }
      >
        <Form.Item name={`comment_${post.id}`} style={{ marginBottom: 8 }}>
          <div className="comment-input-container">
            <Avatar
              src={post.user.avatarUrl}
              size={32}
              icon={<UserOutlined />}
            />
            <TextArea
              placeholder="Viết bình luận..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="comment-input"
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                const content = e.target.value;
                handleSubmitComment(post.id, content);
              }}
            />
            <Button
              type="primary"
              htmlType="submit"
              loading={isCommenting}
              icon={<SendOutlined />}
              size="small"
              className="comment-submit-btn"
            >
              Gửi
            </Button>
          </div>
        </Form.Item>
      </Form>

      {/* Comments List */}
      {nestedComments.length > 0 ? (
        <div className="comments-list" style={{ position: "relative" }}>
          {nestedComments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="no-comments">
          <Text type="secondary">Chưa có bình luận nào</Text>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
