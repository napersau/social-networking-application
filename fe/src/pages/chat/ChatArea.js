import React from "react";
import { Box, Typography } from "@mui/material";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatArea = ({
  selectedConversation,
  currentMessages,
  setCurrentMessages,
  message,
  onMessageChange,
  onSendMessage,
  messageContainerRef,
  onUpdateConversation, // 👈 thêm prop này
}) => {
  if (!selectedConversation) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0, // Important for flex scrolling
      }}
    >
      {/* Truyền callback xuống Header */}
      <ChatHeader
        selectedConversation={selectedConversation}
        onUpdateConversation={onUpdateConversation}
      />
      <MessageList
        ref={messageContainerRef}
        messages={currentMessages}
        setMessages={setCurrentMessages}
      />
      <MessageInput
        message={message}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
      />
    </Box>
  );
};

export default ChatArea;
