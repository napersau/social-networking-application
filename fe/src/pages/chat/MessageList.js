import React, { forwardRef, useState } from "react";
import {
  Avatar,
  Typography,
  Modal,
  Dropdown,
  Button,
  Tooltip,
  message,
} from "antd";
import { MoreOutlined, SmileOutlined } from "@ant-design/icons";
import { recallMessage, reactToMessage } from "../../services/chatService";
import "./styles.css";

const { Text } = Typography;

const MessageList = forwardRef(({ messages, setMessages }, ref) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleRecall = async (messageId) => {
    Modal.confirm({
      title: "Thu hồi tin nhắn",
      content: "Bạn có chắc muốn thu hồi tin nhắn này?",
      onOk: async () => {
        try {
          const response = await recallMessage(messageId);
          const isRecalled = response.data.result;

          const updatedMessages = messages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  message: "[Tin nhắn đã thu hồi]",
                  mediaList: [],
                  isRecalled: true,
                }
              : msg
          );
          setMessages(updatedMessages);
          message.success("Thu hồi tin nhắn thành công");
        } catch (error) {
          console.error("Thu hồi tin nhắn thất bại:", error);
          message.error("Thu hồi tin nhắn thất bại");
        }
      },
    });
  };

  const handleReact = async (messageId, conversationId) => {
    // Hiển thị modal chọn cảm xúc
    const reactions = ["❤️", "😆", "😢", "👍", "👎", "😮", "😡"];
    Modal.confirm({
      title: "Chọn cảm xúc",
      content: (
        <div className="reaction-selector">
          {reactions.map((reaction) => (
            <Button
              key={reaction}
              type="text"
              size="large"
              className="reaction-button"
              onClick={() =>
                performReaction(messageId, conversationId, reaction)
              }
            >
              {reaction}
            </Button>
          ))}
        </div>
      ),
      footer: null,
      closable: true,
    });
  };

  const performReaction = async (messageId, conversationId, reaction) => {
    Modal.destroyAll(); // Đóng modal chọn cảm xúc
    try {
      const response = await reactToMessage({
        id: messageId,
        conversationId,
        reactionType: reaction,
      });
      const { id, reactionType: newReaction } = response.data.result;

      const updatedMessages = messages.map((msg) =>
        msg.id === id ? { ...msg, reactionType: newReaction } : msg
      );
      setMessages(updatedMessages);
      message.success("Thả cảm xúc thành công");
    } catch (error) {
      console.error("Thả cảm xúc thất bại:", error);
      message.error("Thả cảm xúc thất bại");
    }
  };

  const getMenuItems = (messageId) => [
    {
      key: "recall",
      label: "Thu hồi tin nhắn",
      onClick: () => handleRecall(messageId),
    },
  ];

  return (
    <div ref={ref} className="message-list-container">
      <div className="messages-wrapper">
        {messages.length === 0 ? (
          <div className="empty-message">
            <Text type="secondary">
              No messages yet. Start the conversation!
            </Text>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.me;
            const backgroundColor = isMe
              ? msg.failed
                ? "#ffebee"
                : "#e3f2fd"
              : "#f5f5f5";
            return (
              <div
                key={msg.id || `${msg.createdDate}-${msg.message}`}
                className={`message-row ${isMe ? "me" : "other"}`}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {!isMe && (
                  <Avatar
                    src={msg.sender?.avatar}
                    size={32}
                    className="message-avatar"
                  />
                )}

                <div className="message-content">
                  <div
                    className={`message-bubble ${isMe ? "me" : "other"} ${
                      msg.pending ? "pending" : ""
                    }`}
                    style={{ backgroundColor }}
                  >
                    <Text
                      className="message-text"
                      style={{
                        fontStyle: msg.isRecalled ? "italic" : "normal",
                        color: msg.isRecalled ? "gray" : "inherit",
                      }}
                    >
                      {msg.isRecalled ? "[Tin nhắn đã thu hồi]" : msg.message}
                    </Text>

                    {!msg.isRecalled && msg.mediaList?.length > 0 && (
                      <div className="image-gallery">
                        {msg.mediaList.map((media, index) =>
                          media.type.startsWith("image") ? (
                            <img
                              key={index}
                              src={media.url}
                              alt={`media-${index}`}
                              onClick={() => setSelectedImage(media.url)}
                              className="message-image"
                            />
                          ) : null
                        )}
                      </div>
                    )}

                    <div className="timestamp-stack">
                      {msg.failed && (
                        <Text type="danger" className="status-text">
                          Failed to send
                        </Text>
                      )}
                      {msg.pending && (
                        <Text type="secondary" className="status-text">
                          Sending...
                        </Text>
                      )}
                      <Text type="secondary" className="timestamp-text">
                        {new Date(msg.createdDate).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Text>

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="message-reactions-group">
                          {Object.entries(
                            msg.reactions.reduce((acc, reaction) => {
                              acc[reaction.reactionType] =
                                (acc[reaction.reactionType] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([emoji, count]) => (
                            <span key={emoji} className="reaction-summary">
                              {emoji} {count > 1 ? count : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút thả cảm xúc và menu - hiển thị bên cạnh tin nhắn */}
                  {!msg.isRecalled && hoveredId === msg.id && (
                    <div className={`message-actions ${isMe ? "me" : "other"}`}>
                      <Tooltip title="Thả cảm xúc">
                        <Button
                          type="text"
                          size="small"
                          icon={<SmileOutlined />}
                          className="action-button"
                          onClick={() =>
                            handleReact(msg.id, msg.conversationId)
                          }
                        />
                      </Tooltip>

                      {isMe && !msg.failed && (
                        <Dropdown
                          menu={{ items: getMenuItems(msg.id) }}
                          trigger={["click"]}
                          placement="bottomRight"
                        >
                          <Tooltip title="Tùy chọn">
                            <Button
                              type="text"
                              size="small"
                              icon={<MoreOutlined />}
                              className="action-button"
                            />
                          </Tooltip>
                        </Dropdown>
                      )}
                    </div>
                  )}
                </div>

                {isMe && (
                  <Avatar
                    size={32}
                    className="message-avatar"
                    style={{ backgroundColor: "#1976d2" }}
                  >
                    You
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Preview ảnh lớn */}
      <Modal
        open={Boolean(selectedImage)}
        onCancel={() => setSelectedImage(null)}
        footer={null}
        width="80%"
        centered
      >
        <img
          src={selectedImage}
          alt="Preview"
          style={{ width: "100%", height: "auto", objectFit: "contain" }}
        />
      </Modal>
    </div>
  );
});

MessageList.displayName = "MessageList";
export default MessageList;
