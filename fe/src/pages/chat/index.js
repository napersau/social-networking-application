import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Card } from "@mui/material";
import { io } from "socket.io-client";
import "./styles.css";
import ConversationList from "./ConversationList";
import ChatArea from "./ChatArea";
import NewChatPopover from "../../components/newChatPopover";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
  markMessagesAsRead,
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
  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);

  // Function to scroll to the bottom of the message container instantly
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "auto", // Changed from 'smooth' to 'auto' for instant scrolling
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
          }
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
  }, [selectedConversation, messagesMap]);

  const currentMessages = selectedConversation
    ? messagesMap[selectedConversation.id] || []
    : [];

  // Auto-scroll to bottom only when new messages arrive or conversation changes
  useEffect(() => {
    // Only auto-scroll if user is near the bottom (within 100px)
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isNearBottom) {
        scrollToBottom(); // Removed setTimeout for instant scrolling
      }
    }
  }, [currentMessages, scrollToBottom]);

  // Scroll to bottom instantly when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom(); // Removed setTimeout for instant scrolling
    }
  }, [selectedConversation, scrollToBottom]);

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

      socketRef.current.on("message", (message) => {
        console.log("New message received:", message);

        const messageObject = JSON.parse(message);
        console.log("Parsed message object:", messageObject);

        // Update messages in the UI when a new message is received
        if (messageObject?.conversationId) {
          handleIncomingMessage(messageObject);
        }
      });

      // 🔧 Handle incoming reactions
      socketRef.current.on("reaction", (data) => {
        const { messageId, reactions } = JSON.parse(data);

        setMessagesMap((prev) => {
          const updatedMap = { ...prev };

          for (const convId in updatedMap) {
            updatedMap[convId] = updatedMap[convId].map((msg) =>
              msg.id === messageId ? { ...msg, reactions } : msg
            );
          }

          return updatedMap;
        });
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
        />
        <NewChatPopover
          open={Boolean(newChatAnchorEl)}
          onClose={handleCloseNewChat}
          onSelectUser={handleSelectNewChatUser}
        />
      </Card>
    </Box>
  );
}
