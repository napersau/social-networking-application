import React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput = ({ message, onMessageChange, onSendMessage }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box
      component="form"
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        display: "flex",
        flexShrink: 0,
        backgroundColor: "background.paper",
      }}
      onSubmit={handleSubmit}
    >
      <TextField
        fullWidth
        placeholder="Type a message..."
        variant="outlined"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={handleKeyPress}
        size="small"
        multiline
        maxRows={4}
      />
      <IconButton
        color="primary"
        sx={{ ml: 1 }}
        onClick={onSendMessage}
        disabled={!message.trim()}
        type="submit"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;