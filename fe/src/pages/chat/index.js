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
} from "antd";
import {
  SendOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../../services/chatService";
import { io } from "socket.io-client";
import MessageList from "./MessageList";
import NewChatPopover from "./NewChatPopover";
import "./styles.css";

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

export default function Chat() {
  const [message, setMessage] = useState("");
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const messageContainerRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);
  const socketRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        if (container) container.scrollTop = container.scrollHeight;
      }, 300);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      message,
      createdDate: new Date().toISOString(),
      me: true,
      pending: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: message, lastTimestamp: new Date().toLocaleString() }
          : c
      )
    );

    setMessage("");

    try {
      await createMessage({
        conversationId: selectedConversation.id,
        message,
        clientId: tempId,
      });
    } catch (err) {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedConversation.id]: prev[selectedConversation.id].map((msg) =>
          msg.id === tempId ? { ...msg, failed: true, pending: false } : msg
        ),
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyConversations();
      setConversations(res?.data?.result || []);
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversations.length && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation?.id && !messagesMap[selectedConversation.id]) {
      getMessages(selectedConversation.id)
        .then((res) => {
          const sorted = [...res.data.result].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          );
          setMessagesMap((prev) => ({ ...prev, [selectedConversation.id]: sorted }));
        })
        .catch(console.error);
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation?.id ? { ...c, unread: 0 } : c))
    );
  }, [selectedConversation, messagesMap]);

  const currentMessages = selectedConversation ? messagesMap[selectedConversation.id] || [] : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  useEffect(() => {
    const socket = io("http://localhost:9092");
    socketRef.current = socket;

    socket.on("message", (msg) => {
      setMessagesMap((prev) => {
        const msgs = prev[msg.conversationId] || [];
        const index = msg.clientId ? msgs.findIndex((m) => m.id === msg.clientId) : -1;
        if (index !== -1) msgs[index] = { ...msg, pending: false, failed: false };
        else msgs.push(msg);
        return {
          ...prev,
          [msg.conversationId]: [...msgs].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          ),
        };
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.message,
                lastTimestamp: new Date(msg.createdDate).toLocaleString(),
                unread:
                  selectedConversationRef.current?.id === c.id
                    ? 0
                    : (c.unread || 0) + 1,
              }
            : c
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (selectedConversation?.id && socketRef.current) {
      const socket = socketRef.current;
      socket.emit("join-conversation", selectedConversation.id);
      return () => socket.emit("leave-conversation", selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  return (
    <Card className="chat-container chat-card-body">
      <Layout className="chat-layout">
        <Sider width={300} className="chat-sidebar">
          <div className="sidebar-header">
            <Title level={4}>Chats</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setNewChatVisible(true)}
              className="new-chat-button"
            />
            <NewChatPopover
              open={newChatVisible}
              onClose={() => setNewChatVisible(false)}
              onSelectUser={async (user) => {
                const res = await createConversation({
                  type: "DIRECT",
                  participantIds: [user.id],
                });
                const conv = res?.data?.result;
                const exists = conversations.find((c) => c.id === conv.id);
                if (exists) setSelectedConversation(exists);
                else {
                  setConversations([conv, ...conversations]);
                  setSelectedConversation(conv);
                }
              }}
            />
          </div>
          <div className="conversations-container">
            {loading ? (
              <Spin size="large" className="loading-container" />
            ) : error ? (
              <Alert
                message={error}
                type="error"
                action={
                  <Button icon={<ReloadOutlined />} onClick={fetchConversations} />
                }
              />
            ) : conversations.length === 0 ? (
              <Text type="secondary">No conversations yet. Start a new chat to begin.</Text>
            ) : (
              <List
                dataSource={conversations}
                renderItem={(c) => (
                  <List.Item
                    onClick={() => setSelectedConversation(c)}
                    className={`conversation-item ${selectedConversation?.id === c.id ? "selected" : ""}`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={c.unread} offset={[-5, 5]} size="small">
                          <Avatar src={c.conversationAvatar} />
                        </Badge>
                      }
                      title={
                        <div className="conversation-title">
                          <Text strong={c.unread > 0} ellipsis={{ tooltip: c.conversationName }}>
                            {c.conversationName}
                          </Text>
                          <Text type="secondary" className="conversation-time">
                            {new Date(c.modifiedDate).toLocaleDateString("vi-VN")}
                          </Text>
                        </div>
                      }
                      description={
                        <Text ellipsis={{ tooltip: c.lastMessage }}>
                          {c.lastMessage || "Start a conversation"}
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
                <MessageList messages={currentMessages} />
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
            <Title level={4} type="secondary">
              Select a conversation to start chatting
            </Title>
          )}
        </Content>
      </Layout>
    </Card>
  );
}