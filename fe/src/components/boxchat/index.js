import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, List, Spin, Typography, Image } from 'antd';
import { SendOutlined, MinusOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { getMessages } from '../../services/chatService';
import './styles.css';

const { Text } = Typography;

function ChatBox({ conversation, onClose, onMinimize, isMinimized }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation && !isMinimized) {
      fetchMessages();
    }
  }, [conversation, isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // Gọi API send message ở đây
      // await sendMessage(conversation.id, newMessage);
      
      // Tạm thời thêm message mới vào danh sách (demo)
      const tempMessage = {
        id: Date.now(),
        conversationId: conversation.id,
        message: newMessage,
        me: true,
        createdDate: new Date().toISOString(),
        sender: {
          firstName: 'Bạn',
          lastName: ''
        },
        isRead: false,
        mediaList: [],
        reactions: []
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Sau khi gửi thành công, có thể fetch lại messages
      // await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);

  if (isMinimized) {
    return (
      <div className="chatbox-minimized" onClick={onMinimize}>
        <Avatar
          src={conversation?.conversationAvatar}
          icon={<UserOutlined />}
          size={32}
        />
        <Text className="chatbox-minimized-name">
          {conversation?.conversationName}
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
            src={conversation?.conversationAvatar}
            icon={<UserOutlined />}
            size={32}
          />
          <Text strong className="chatbox-title">
            {conversation?.conversationName}
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
                  const isMe = message.me;
                  const backgroundColor = isMe ? '#1890ff' : '#f0f0f0';
                  
                  return (
                    <div
                      key={message.id}
                      className={`message ${
                        isMe ? 'message-sent' : 'message-received'
                      }`}
                    >
                      <div className="message-content">
                        <div
                          className={`message-bubble ${isMe ? "me" : "other"} ${
                            message.pending ? "pending" : ""
                          }`}
                          style={{ backgroundColor }}
                        >
                          <Text
                            className="message-text"
                            style={{
                              fontStyle: message.isRecalled ? "italic" : "normal",
                              color: message.isRecalled ? "gray" : isMe ? "white" : "inherit",
                            }}
                          >
                            {message.isRecalled ? "[Tin nhắn đã thu hồi]" : message.message}
                          </Text>

                          {!message.isRecalled && message.mediaList?.length > 0 && (
                            <div className="image-gallery">
                              {message.mediaList.map((media, index) =>
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
                        </div>
                      </div>
                      <Text className="message-time" type="secondary">
                        {new Date(message.createdDate).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </div>
                  );
                }}
              />
            )}
          </Spin>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chatbox-input">
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ border: 'none', resize: 'none' }}
          />
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!newMessage.trim()}
          />
        </div>
      </div>

      {/* Image Modal/Preview */}
      {selectedImage && (
        <div 
          className="image-modal" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-modal-content">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="modal-image"
            />
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