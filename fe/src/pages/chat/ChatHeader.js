import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const ChatHeader = ({ selectedConversation }) => {
  if (!selectedConversation) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        backgroundColor: "background.paper",
      }}
    >
      <Avatar
        src={selectedConversation.conversationAvatar}
        sx={{ mr: 2 }}
      />
      <Typography variant="h6">
        {selectedConversation.conversationName}
      </Typography>
    </Box>
  );
};

export default ChatHeader;