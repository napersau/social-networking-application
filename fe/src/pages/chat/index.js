import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Layout,
  Card,
  Input,
  Typography,
  Button,
  Avatar,
  List,
  Badge,
  Spin,
  Alert,
  Space,
  Popover,
} from "antd";
import {
  SendOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../../services/chatService";
import{
  searchUsers
} from "../../services/userService"
import { io } from "socket.io-client";
import "./styles.css";

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

// Component NewChatPopover
const NewChatPopover = ({ open, onClose, onSelectUser }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (keyword) => {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      // Gửi object chứa username keyword
      const response = await searchUsers(keyword);
      setUsers(response?.data?.result || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchKeyword]);

  const content = (
    <div className="new-chat-popover">
      <Input
        placeholder="Search users by username..."
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="search-input"
      />
      <div className="user-list">
        {loading ? (
          <div className="loading-container">
            <Spin size="small" />
          </div>
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => (
              <List.Item
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                  setSearchKeyword("");
                  setUsers([]);
                }}
                className="user-item"
              >
                <List.Item.Meta
                  avatar={<Avatar src={user.avatar} />}
                  title={user.displayName}
                  description={`@${user.username}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Start New Chat"
      open={open}
      onOpenChange={onClose}
      trigger="click"
      placement="bottomRight"
    >
      <div />
    </Popover>
  );
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const messageContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;

      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 100);

      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 300);
    }
  }, []);

  const handleNewChatClick = () => {
    setNewChatVisible(true);
  };

  const handleCloseNewChat = () => {
    setNewChatVisible(false);
  };

  const handleSelectNewChatUser = async (user) => {
    const response = await createConversation({
      type: "DIRECT",
      participantIds: [user.userId],
    });

    const newConversation = response?.data?.result;

    const existingConversation = conversations.find(
      (conv) => conv.id === newConversation.id
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);
      setSelectedConversation(newConversation);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyConversations();
      setConversations(response?.data?.result || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    const fetchMessages = async (conversationId) => {
      try {
        if (!messagesMap[conversationId]) {
          const response = await getMessages(conversationId);
          if (response?.data?.result) {
            const sortedMessages = [...response.data.result].sort(
              (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
            );

            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: sortedMessages,
            }));
          }
        }

        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: 0 } : conv
          )
        );
      } catch (err) {
        console.error(
          `Error fetching messages for conversation ${conversationId}:`,
          err
        );
      }
    };

    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, messagesMap]);

  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, scrollToBottom]);

  useEffect(() => {
    console.log("Initializing socket connection...");
    const socket = new io("http://localhost:9092");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("message", (message) => {
      console.log("New message received:", message);
    });

    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect();
    };
  }, []);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      content: message,
      timestamp: new Date().toISOString(),
      me: true,
      pending: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        newMessage,
      ],
    }));

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: message,
              lastTimestamp: new Date().toLocaleString(),
            }
          : conv
      )
    );

    setMessage("");

    try {
      const response = await createMessage({
        conversationId: selectedConversation.id,
        message: message,
      });

      if (response?.data?.result) {
        setMessagesMap((prev) => {
          const updatedMessages = prev[selectedConversation.id].filter(
            (msg) => msg.id !== tempId
          );

          return {
            ...prev,
            [selectedConversation.id]: [
              ...updatedMessages,
              response.data.result,
            ].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)),
          };
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      setMessagesMap((prev) => {
        const updatedMessages = prev[selectedConversation.id].map((msg) =>
          msg.id === tempId ? { ...msg, failed: true, pending: false } : msg
        );

        return {
          ...prev,
          [selectedConversation.id]: updatedMessages,
        };
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="chat-container">
      <Layout className="chat-layout">
        <Sider width={300} className="chat-sidebar">
          <div className="sidebar-header">
            <Title level={4}>Chats</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewChatClick}
              className="new-chat-button"
            />
            <NewChatPopover
              open={newChatVisible}
              onClose={handleCloseNewChat}
              onSelectUser={handleSelectNewChatUser}
            />
          </div>

          <div className="conversations-container">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : error ? (
              <Alert
                message={error}
                type="error"
                action={
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={fetchConversations}
                  />
                }
              />
            ) : conversations.length === 0 ? (
              <div className="empty-state">
                <Text type="secondary">
                  No conversations yet. Start a new chat to begin.
                </Text>
              </div>
            ) : (
              <List
                dataSource={conversations}
                renderItem={(conversation) => (
                  <List.Item
                    onClick={() => handleConversationSelect(conversation)}
                    className={`conversation-item ${
                      selectedConversation?.id === conversation.id
                        ? "selected"
                        : ""
                    }`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge
                          count={conversation.unread}
                          offset={[-5, 5]}
                          size="small"
                        >
                          <Avatar src={conversation.conversationAvatar} />
                        </Badge>
                      }
                      title={
                        <div className="conversation-title">
                          <Text
                            strong={conversation.unread > 0}
                            ellipsis={{ tooltip: conversation.conversationName }}
                          >
                            {conversation.conversationName}
                          </Text>
                          <Text type="secondary" className="conversation-time">
                            {new Date(conversation.modifiedDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </div>
                      }
                      description={
                        <Text ellipsis={{ tooltip: conversation.lastMessage }}>
                          {conversation.lastMessage || "Start a conversation"}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Sider>

        <Content className="chat-content">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <Avatar src={selectedConversation.conversationAvatar} />
                <Title level={5} className="chat-title">
                  {selectedConversation.conversationName}
                </Title>
              </div>

              <div className="messages-container" ref={messageContainerRef}>
                <div className="messages-wrapper">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-item ${msg.me ? "own-message" : ""}`}
                    >
                      {!msg.me && (
                        <Avatar
                          src={msg.sender?.avatar}
                          size="small"
                          className="message-avatar"
                        />
                      )}
                      <Card
                        className={`message-card ${
                          msg.me ? "own-message-card" : ""
                        } ${msg.failed ? "failed-message" : ""} ${
                          msg.pending ? "pending-message" : ""
                        }`}
                      >
                        <Text>{msg.message}</Text>
                        <div className="message-footer">
                          {msg.failed && (
                            <Text type="danger" className="message-status">
                              Failed to send
                            </Text>
                          )}
                          {msg.pending && (
                            <Text type="secondary" className="message-status">
                              Sending...
                            </Text>
                          )}
                          <Text type="secondary" className="message-time">
                            {new Date(msg.createdDate).toLocaleString()}
                          </Text>
                        </div>
                      </Card>
                      {msg.me && (
                        <Avatar className="message-avatar own-avatar">
                          You
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="message-input-container">
                <Input
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="message-input"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="send-button"
                />
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <Title level={4} type="secondary">
                Select a conversation to start chatting
              </Title>
            </div>
          )}
        </Content>
      </Layout>
    </Card>
  );
}


