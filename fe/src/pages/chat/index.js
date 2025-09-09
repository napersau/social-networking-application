import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Card } from "@mui/material";
import { io } from "socket.io-client";
import "./styles.css";
import ConversationList from "./ConversationList";
import ChatArea from "./ChatArea";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
  markMessagesAsRead,
  createConversationGroup,
} from "../../services/chatService";
import { getToken } from "../../services/localStorageService";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);

  // Function to scroll to the bottom of the message container
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      // Use requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, []);

  // New chat popover handlers
  const handleNewChatClick = (event) => {
    setNewChatAnchorEl(event.currentTarget);
  };

  const handleCloseNewChat = () => {
    setNewChatAnchorEl(null);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await createConversationGroup({
        type: "GROUP",
        name: groupData.name,
        participantIds: groupData.participantIds,
      });

      const newConversation = response?.data?.result;
      if (newConversation) {
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleSelectNewChatUser = async (user) => {
    const response = await createConversation({
      type: "DIRECT",
      participantIds: [user.id],
    });

    const newConversation = response?.data?.result;

    // Check if we already have a conversation with this user
    const existingConversation = conversations.find(
      (conv) => conv.id === newConversation.id
    );

    if (existingConversation) {
      // If conversation exists, just select it
      setSelectedConversation(existingConversation);
    } else {
      // Add to conversations list
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);

      // Select this new conversation
      setSelectedConversation(newConversation);
    }

    handleCloseNewChat();
  };

  // Fetch conversations from API
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

  // Load conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Initialize with first conversation selected when available
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load messages from the conversation history when a conversation is selected
  useEffect(() => {
    const fetchMessagesForConversation = async (conversationId) => {
      try {
        // Check if we already have messages for this conversation
        if (!messagesMap[conversationId]) {
          const response = await getMessages(conversationId);
          if (response?.data?.result) {
            // Sort messages by createdDate to ensure chronological order
            const sortedMessages = [...response.data.result].sort(
              (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
            );
            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: sortedMessages,
            }));
            
            // Scroll to bottom after messages are loaded
            setTimeout(() => scrollToBottom(), 500);
          }
        } else {
          // If messages already exist, still scroll to bottom
          setTimeout(() => scrollToBottom(), 200);
        }
        // Mark conversation as read when selected
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
      fetchMessagesForConversation(selectedConversation.id);
    }
  }, [selectedConversation, scrollToBottom]);

  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentMessages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [currentMessages.length, scrollToBottom]);

  // Socket connection setup
  useEffect(() => {
    // Initialize socket connection only once
    if (!socketRef.current) {
      console.log("Initializing socket connection...");

      const connectionUrl = "http://localhost:9092?token=" + getToken();
      socketRef.current = new io(connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      // 🔹 Khi có user online
      socketRef.current.on("user_online", (userId) => {
        console.log("User online:", userId);
        setOnlineUsers((prev) => [...new Set([...prev, userId])]); // thêm nếu chưa có
      });

      // 🔹 Khi có user offline
      socketRef.current.on("user_offline", (userId) => {
        console.log("User offline:", userId);
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      socketRef.current.on("message", (message) => {
        console.log("New message received:", message);

        const messageObject = JSON.parse(message);
        console.log("Parsed message object:", messageObject);

        // Update messages in the UI when a new message is received
        if (messageObject?.conversationId) {
          handleIncomingMessage(messageObject);
        }
      });

      socketRef.current.on("recalled", (data) => {
        try {
          const recalledMsg = JSON.parse(data);
          console.log(">>> recalled event", recalledMsg);

          // Gọi hàm xử lý recalled message - tương tự như message
          handleIncomingRecalled(recalledMsg);
        } catch (err) {
          console.error("Error handling recalled:", err);
        }
      });

      socketRef.current.on("reaction", (data) => {
        try {
          const reactionData = JSON.parse(data);
          console.log("reaction: ", data);
          console.log("Parsed reaction data:", reactionData);
          
          const { messageId, userId, reactionType } = reactionData;

          setMessagesMap((prev) => {
            const updatedMap = { ...prev };

            for (const convId in updatedMap) {
              updatedMap[convId] = updatedMap[convId].map((msg) => {
                if (msg.id === messageId) {
                  // Khởi tạo reactions array nếu chưa có
                  const currentReactions = msg.reactions || [];
                  
                  // Tìm reaction hiện tại của user này
                  const existingReactionIndex = currentReactions.findIndex(
                    r => r.userId === userId
                  );
                  
                  let updatedReactions;
                  if (existingReactionIndex >= 0) {
                    // Update reaction hiện tại
                    updatedReactions = [...currentReactions];
                    updatedReactions[existingReactionIndex] = {
                      ...updatedReactions[existingReactionIndex],
                      reactionType
                    };
                  } else {
                    // Thêm reaction mới
                    updatedReactions = [
                      ...currentReactions,
                      {
                        userId,
                        reactionType,
                        user: { id: userId } // có thể cần thêm thông tin user khác
                      }
                    ];
                  }
                  
                  console.log("Updated reactions for message", messageId, ":", updatedReactions);
                  
                  return { ...msg, reactions: updatedReactions };
                }
                return msg;
              });
            }

            return updatedMap;
          });
        } catch (error) {
          console.error("Error handling reaction:", error);
        }
      });

      // Socket listener cho tin nhắn được cập nhật
      socketRef.current.on("messageUpdated", (data) => {
        try {
          const updatedMessage = JSON.parse(data);
          console.log("Message updated received:", updatedMessage);

          // Cập nhật tin nhắn trong messagesMap
          setMessagesMap((prev) => {
            const updatedMap = { ...prev };

            for (const convId in updatedMap) {
              updatedMap[convId] = updatedMap[convId].map((msg) =>
                msg.id === updatedMessage.id 
                  ? { 
                      ...msg, 
                      message: updatedMessage.message,
                      updatedDate: updatedMessage.updatedDate
                    } 
                  : msg
              );
            }

            return updatedMap;
          });

          // Cập nhật lastMessage trong conversation list nếu đây là tin nhắn cuối
          setConversations((prev) => {
            return prev.map((conv) => {
              if (conv.id === updatedMessage.conversationId) {
                // Kiểm tra xem tin nhắn được cập nhật có phải là tin nhắn cuối không
                const messages = messagesMap[conv.id] || [];
                const isLastMessage = messages.length > 0 && 
                  messages[messages.length - 1].id === updatedMessage.id;
                
                if (isLastMessage) {
                  return {
                    ...conv,
                    lastMessage: updatedMessage.message,
                    lastTimestamp: new Date(updatedMessage.updatedDate || new Date()).toLocaleString(),
                    modifiedDate: updatedMessage.updatedDate || new Date().toISOString(),
                  };
                }
              }
              return conv;
            });
          });

        } catch (err) {
          console.error("Error handling message update:", err);
        }
      });
    }

    // Cleanup function - disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Update unread count when conversation is selected
  useEffect(() => {
    const markAsRead = async () => {
      if (selectedConversation?.id) {
        try {
          await markMessagesAsRead(selectedConversation.id);
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === selectedConversation.id
                ? { ...conv, unread: 0 }
                : conv
            )
          );
        } catch (error) {
          console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
      }
    };

    markAsRead();
  }, [selectedConversation]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async ({ message: text, mediaUrls }) => {
    if ((!text?.trim() && mediaUrls.length === 0) || !selectedConversation)
      return;
    setMessage("");
    try {
      const response = await createMessage({
        conversationId: selectedConversation.id,
        message: text,
        mediaUrls: mediaUrls,
      });

      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(text);
    }
  };

  // thêm hàm xử lý update
  const handleUpdateConversation = (updatedConv) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === updatedConv.id ? { ...conv, ...updatedConv } : conv
      )
    );
    if (selectedConversation?.id === updatedConv.id) {
      setSelectedConversation((prev) => ({ ...prev, ...updatedConv }));
    }
  };
  // Helper function to handle incoming socket messages
  const handleIncomingMessage = useCallback(
    (message) => {
      // Add the new message to the appropriate conversation
      setMessagesMap((prev) => {
        const existingMessages = prev[message.conversationId] || [];
        // Check if message already exists to avoid duplicates
        const messageExists = existingMessages.some((msg) => {
          // Primary: Compare by ID if both messages have IDs
          if (msg.id && message.id) {
            return msg.id === message.id;
          }
          return false;
        });
        if (!messageExists) {
          const updatedMessages = [...existingMessages, message].sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          );
          return {
            ...prev,
            [message.conversationId]: updatedMessages,
          };
        }
        console.log("Message already exists, not adding");
        return prev;
      });
      // Update the conversation list with the new last message
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.message,
                lastTimestamp: new Date(message.createdDate).toLocaleString(),
                modifiedDate: message.createdDate,
              }
            : conv
        );
        return updatedConversations;
      });
    },
    [selectedConversation]
  );

  const handleIncomingRecalled = useCallback((recalledMsg) => {
    console.log("Handling incoming recalled:", recalledMsg);

    // Update messages map - đánh dấu tin nhắn đã bị thu hồi
    setMessagesMap((prev) => {
      const updatedMap = { ...prev };
      if (updatedMap[recalledMsg.conversationId]) {
        updatedMap[recalledMsg.conversationId] = updatedMap[
          recalledMsg.conversationId
        ].map((msg) =>
          msg.id === recalledMsg.id 
            ? { 
                ...msg, 
                isRecalled: true,  // ✅ Đổi từ recalled thành isRecalled để khớp với backend
                message: "[Tin nhắn đã thu hồi]"  // ✅ Cập nhật message luôn
              } 
            : msg
        );
        console.log(
          "Updated messagesMap for recalled:",
          updatedMap[recalledMsg.conversationId]
        );
      }
      return updatedMap;
    });

    // Update conversations list - cập nhật lastMessage nếu tin nhắn bị thu hồi là tin nhắn cuối
    setConversations((prev) => {
      const updatedConversations = prev.map((conv) => {
        if (conv.id === recalledMsg.conversationId) {
          // ✅ Kiểm tra xem tin nhắn bị thu hồi có phải là tin nhắn cuối không
          // So sánh với ID của tin nhắn cuối cùng
          const lastMessageInConv = prev.find(c => c.id === recalledMsg.conversationId);
          if (lastMessageInConv && (
            lastMessageInConv.lastMessageId === recalledMsg.id ||
            // Fallback: so sánh với message content nếu không có lastMessageId
            (lastMessageInConv.lastMessage && lastMessageInConv.lastMessage === recalledMsg.message)
          )) {
            console.log(
              "Updating lastMessage for recalled in conversation:",
              conv.id
            );
            return {
              ...conv,
              lastMessage: "[Tin nhắn đã được thu hồi]",
              lastTimestamp: new Date(
                recalledMsg.modifiedDate || new Date()
              ).toLocaleString(),
              modifiedDate:
                recalledMsg.modifiedDate || new Date().toISOString(),
            };
          }
        }
        return conv;
      });
      return updatedConversations;
    });
  }, []);

  return (
    <Box className="chat-container">
      <Card className="chat-card">
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          onNewChatClick={handleNewChatClick}
          onRefresh={fetchConversations}
          onlineUsers={onlineUsers}
          onSelectUser={handleSelectNewChatUser}
          onCreateGroup={handleCreateGroup}
        />
        <ChatArea
          selectedConversation={selectedConversation}
          currentMessages={currentMessages}
          setCurrentMessages={(updatedMessages) => {
            if (selectedConversation?.id) {
              setMessagesMap((prev) => ({
                ...prev,
                [selectedConversation.id]: updatedMessages,
              }));
            }
          }}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          messageContainerRef={messageContainerRef}
          onUpdateConversation={handleUpdateConversation}
        />
      </Card>
    </Box>
  );
}
