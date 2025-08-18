import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Avatar,
  List,
  Spin,
  Typography,
  Button,
} from "antd";
import {
  MinusOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getMessages, createMessage } from "../../services/chatService";
import { io } from "socket.io-client";
import { getToken } from "../../services/localStorageService";
import MessageInput from "../../pages/chat/MessageInput"; // ✅ import component mới
import "./styles.css";

const { Text } = Typography;

function ChatBox({ conversation, onClose, onMinimize, isMinimized }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  /* ---------- Fetch messages khi mở conversation ---------- */
  useEffect(() => {
    if (conversation && !isMinimized) {
      fetchMessages();
    }
  }, [conversation, isMinimized]);

  const fetchMessages = async () => {
    if (!conversation?.id) return;
    setLoading(true);
    try {
      const response = await getMessages(conversation.id);
      if (response && response.data && Array.isArray(response.data.result)) {
        setMessages(response.data.result);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Scroll xuống cuối khi messages thay đổi ---------- */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- Xử lý kết nối WebSocket ---------- */
  useEffect(() => {
    if (socketRef.current) return;

    const token = typeof getToken === "function" ? getToken() : null;
    const connectionUrl = `http://localhost:9092?token=${token || ""}`;
    socketRef.current = io(connectionUrl, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Nhận tin nhắn mới
    socketRef.current.on("message", (payload) => {
      try {
        const messageObject =
          typeof payload === "string" ? JSON.parse(payload) : payload;
        handleIncomingMessage(messageObject);
      } catch (err) {
        console.error("Invalid message payload:", err, payload);
      }
    });

    // Nhận phản ứng (reaction)
    socketRef.current.on("reaction", (payload) => {
      try {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        const { messageId, reactions } = data;
        if (!messageId) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
        );
      } catch (err) {
        console.error("Invalid reaction payload:", err, payload);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /* ---------- Join room khi conversation thay đổi ---------- */
  useEffect(() => {
    if (!socketRef.current || !conversation?.id) return;
    try {
      socketRef.current.emit("joinConversation", {
        conversationId: conversation.id,
      });
    } catch (err) {}
  }, [conversation?.id]);

  /* ---------- Xử lý tin nhắn nhận qua socket ---------- */
  const handleIncomingMessage = useCallback(
    (message) => {
      if (!message || !message.conversationId) return;
      if (conversation?.id && message.conversationId !== conversation.id) {
        return;
      }
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.id && message.id && m.id === message.id
        );
        if (!exists) {
          return [...prev, message].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          );
        } else {
          return prev.map((m) =>
            m.id === message.id ? { ...m, ...message } : m
          );
        }
      });
    },
    [conversation?.id]
  );

  /* ---------- Gửi tin nhắn với media ---------- */
  const handleSendMessage = async ({ message, mediaUrls }) => {
    if ((!message || !message.trim()) && mediaUrls.length === 0) return;

    setSending(true);
    try {
      await createMessage({
        conversationId: conversation.id,
        message,
        mediaUrls,
      });
      setNewMessage(""); // clear input
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  /* ---------- Render UI ---------- */
  if (isMinimized) {
    return (
      <div className="chatbox-minimized" onClick={onMinimize}>
        <Avatar
          src={conversation?.avatarUrl}
          icon={<UserOutlined />}
          size={32}
        />
        <Text className="chatbox-minimized-name">
          {conversation?.name}
        </Text>
      </div>
    );
  }

  return (
    <Card
      className="chatbox"
      size="small"
      title={
        <div className="chatbox-header">
          <Avatar
            src={conversation?.avatarUrl}
            icon={<UserOutlined />}
            size={32}
          />
          <Text strong className="chatbox-title">
            {conversation?.name}
          </Text>
          <div className="chatbox-controls">
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={onMinimize}
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
            />
          </div>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div className="chatbox-content">
        <div className="chatbox-messages">
          <Spin spinning={loading}>
            {messages.length === 0 ? (
              <div className="no-messages">
                <Text type="secondary">Chưa có tin nhắn nào</Text>
              </div>
            ) : (
              <List
                dataSource={messages}
                renderItem={(message) => {
                  const isMe = !!message.me;
                  const backgroundColor = isMe ? "#1890ff" : "#f0f0f0";
                  return (
                    <div
                      key={message.id}
                      className={`message ${
                        isMe ? "message-sent" : "message-received"
                      }`}
                    >
                      <div className="message-content">
                        <div
                          className={`message-bubble ${isMe ? "me" : "other"}`}
                          style={{ backgroundColor }}
                        >
                          <Text
                            className="message-text"
                            style={{
                              fontStyle: message.isRecalled ? "italic" : "normal",
                              color: message.isRecalled
                                ? "gray"
                                : isMe
                                ? "white"
                                : "inherit",
                            }}
                          >
                            {message.isRecalled
                              ? "[Tin nhắn đã thu hồi]"
                              : message.message}
                          </Text>

                          {!message.isRecalled &&
                            message.mediaList?.length > 0 && (
                              <div className="image-gallery">
                                {message.mediaList.map((media, index) =>
                                  media.type?.startsWith("image") ? (
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
                        </div>
                      </div>
                      <Text className="message-time" type="secondary">
                        {message.createdDate
                          ? new Date(message.createdDate).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </Text>
                    </div>
                  );
                }}
              />
            )}
          </Spin>
          <div ref={messagesEndRef} />
        </div>

        {/* ✅ Sử dụng MessageInput thay vì Input.TextArea */}
        <MessageInput
          message={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content">
            <img src={selectedImage} alt="Preview" className="modal-image" />
            <button
              className="close-modal"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ChatBox;
