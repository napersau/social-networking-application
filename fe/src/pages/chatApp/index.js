import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  List,
  Typography,
  Input,
  Button,
  Modal,
  Spin,
  Badge,
  Avatar
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  PlusOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService';
import WebSocketService from '../../services/webSocketService';
import './styles.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ChatApp = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser] = useState({ id: 1, username: 'user1' });

  const websocketService = useRef(new WebSocketService());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    websocketService.current.connect(handleMessageReceived, console.error);
    return () => websocketService.current.disconnect();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await apiService.getConversations();
      setConversations(data);
    } catch (e) {
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const data = await apiService.getMessages(conversationId);
      setMessages(data.reverse());
    } finally {
      setLoading(false);
    }
  };

  const handleMessageReceived = (messageData) => {
    if (messageData.type === 'MESSAGE') {
      const msg = messageData.message;
      if (selectedConversation?.id === msg.conversationId) {
        setMessages(prev => [...prev, msg]);
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    websocketService.current.sendMessage({
      conversationId: selectedConversation.id,
      content: newMessage,
      messageType: 'TEXT'
    });
    setNewMessage('');
  };

  const openModal = async () => {
    const users = await apiService.getAllUsers();
    setAllUsers(users.filter(u => u.id !== currentUser.id));
    setShowModal(true);
  };

  const startConversationWithUser = async (userId) => {
    console.log(userId)
    const conv = await apiService.createConversation(userId);
    setConversations(prev => [conv, ...prev]);
    setSelectedConversation(conv);
    loadMessages(conv.id);
    setShowModal(false);
  };

  return (
    <Layout className="chat-container">
      <Sider width={300} className="chat-sidebar">
        <Header style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #eee' }}>
          <Text strong>💬 Tin nhắn</Text>
          <Button
            type="link"
            icon={<PlusOutlined />}
            style={{ float: 'right' }}
            onClick={openModal}
          >
            Tạo mới
          </Button>
        </Header>
        <List
          itemLayout="horizontal"
          dataSource={conversations}
          renderItem={item => (
            <List.Item
              onClick={() => {
                setSelectedConversation(item);
                loadMessages(item.id);
              }}
              style={{
                backgroundColor: selectedConversation?.id === item.id ? '#e6f7ff' : undefined,
                cursor: 'pointer',
                padding: '12px 16px',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={true}>
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                }
                title={<Text strong>{item.name}</Text>}
                description={item.lastMessage?.content || 'Không có tin nhắn'}
              />
            </List.Item>
          )}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px' }}>
          {selectedConversation ? (
            <Text strong>{selectedConversation.name}</Text>
          ) : (
            <Text type="secondary">Chọn một cuộc trò chuyện</Text>
          )}
        </Header>
        <Content className="chat-messages">
          {loading ? (
            <Spin />
          ) : selectedConversation ? (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.senderId === currentUser.id
                      ? 'chat-message-own'
                      : 'chat-message-other'
                  }
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '30%' }}>
              <MessageOutlined style={{ fontSize: 40, color: '#ccc' }} />
              <p>Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </Content>

        {selectedConversation && (
          <div className="message-input">
            <Input.TextArea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              placeholder="Nhập tin nhắn..."
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              style={{ marginTop: 8 }}
            >
              Gửi
            </Button>
          </div>
        )}
      </Layout>

      <Modal
        title="Chọn người để bắt đầu cuộc trò chuyện"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <List
          dataSource={allUsers}
          renderItem={(user) => (
            <List.Item onClick={() => startConversationWithUser(user.id)} style={{ cursor: 'pointer' }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {user.username}
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default ChatApp;
