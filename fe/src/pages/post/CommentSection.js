import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  List,
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
} from "@ant-design/icons";
import { commentService } from "../../services/commentService";

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
  const currentUserId = parseInt(localStorage.getItem("userId"));

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
      const response = await commentService.createComment(postId, content.trim());

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

        // Reset input field
        commentForms.resetFields([`comment_${postId}`]); // Sử dụng resetFields thay vì setFieldsValue

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
                (c) => c.id !== commentId
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

  return (
    <div className="comment-section">
      <Divider className="comment-divider" />

      {/* Comment Input Form */}
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
      {comments.length > 0 && (
        <div className="comments-list">
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item
                key={comment.id}
                className="comment-item"
                actions={
                  currentUserId === comment.user?.id ||
                  currentUserId === post.user.id
                    ? [
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
                                onClick={() =>
                                  confirmDeleteComment(comment.id, post.id)
                                }
                              >
                                Xóa
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={["click"]}
                        >
                          <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>,
                      ]
                    : []
                }
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
                            onClick={() =>
                              handleUpdateComment(comment.id, post.id)
                            }
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
                      <Paragraph className="comment-text">
                        {comment.content}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
            split={false}
          />
        </div>
      )}

      {commentCount === 0 && (
        <div className="no-comments">
          <Text type="secondary">Chưa có bình luận nào</Text>
        </div>
      )}
    </div>
  );
};

export default CommentSection;