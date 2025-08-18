import React, { useEffect, useState } from "react";
import { getMyConversations } from "../../services/chatService";
import { List, Avatar, Spin, Typography, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ChatBox from "../boxchat";
import "./styles.css";

const { Title } = Typography;

function FriendListSidebar() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openChats, setOpenChats] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await getMyConversations();
        if (response && response.data && Array.isArray(response.data.result)) {
          setConversations(response.data.result);
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleOpenChat = (conversation) => {
    // Kiểm tra xem chat đã được mở chưa
    const existingChatIndex = openChats.findIndex(chat => chat.id === conversation.id);
    
    if (existingChatIndex === -1) {
      // Giới hạn tối đa 3 chat boxes cùng lúc
      if (openChats.length >= 3) {
        // Xóa chat box đầu tiên và thêm chat mới
        setOpenChats(prev => [...prev.slice(1), { ...conversation, isMinimized: false }]);
      } else {
        // Thêm chat box mới
        setOpenChats(prev => [...prev, { ...conversation, isMinimized: false }]);
      }
    } else {
      // Nếu chat đã tồn tại và đang minimized, thì maximize nó
      if (openChats[existingChatIndex].isMinimized) {
        setOpenChats(prev => 
          prev.map((chat, index) => 
            index === existingChatIndex ? { ...chat, isMinimized: false } : chat
          )
        );
      }
    }
  };

  const handleCloseChat = (chatId) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleMinimizeChat = (chatId) => {
    setOpenChats(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, isMinimized: !chat.isMinimized } : chat
      )
    );
  };

  return (
    <>
      <div className="friend-sidebar">
        <Title level={5} className="friend-title">Cuộc trò chuyện</Title>
        <Spin spinning={loading}>
          {conversations.length === 0 ? (
            <Empty description="Không có cuộc trò chuyện" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={conversations}
              renderItem={(conversation) => {
                const isActive = openChats.some(chat => 
                  chat.id === conversation.id && !chat.isMinimized
                );
                
                return (
                  <List.Item
                    key={conversation.id}
                    className={`friend-item ${isActive ? 'friend-item-active' : ''}`}
                    onClick={() => handleOpenChat(conversation)}
                    style={{ cursor: "pointer" }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={conversation.avatarUrl}
                          icon={<UserOutlined />}
                          size={40}
                        />
                      }
                      title={conversation.name}
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Spin>
      </div>

      {/* Render chat boxes */}
      <div className="chatboxes-container">
        {openChats.map((chat, index) => (
          <div
            key={chat.id}
            style={{
              position: 'fixed',
              bottom: 0,
              right: 80 + (index * 340), // Tính toán vị trí cho multiple chatboxes
              zIndex: 1000 + index
            }}
          >
            <ChatBox
              conversation={chat}
              onClose={() => handleCloseChat(chat.id)}
              onMinimize={() => handleMinimizeChat(chat.id)}
              isMinimized={chat.isMinimized}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default FriendListSidebar;