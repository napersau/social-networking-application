import React, { useState } from "react";
import { Box, Typography, Avatar, TextField, IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { updateConversation } from "../../services/chatService";

const ChatHeader = ({ selectedConversation, onUpdateConversation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(selectedConversation?.name || "");

  if (!selectedConversation) return null;

  const handleSave = async () => {
    try {
      // Gọi API PUT update tên nhóm
      await updateConversation(selectedConversation.id, { name: groupName });

      setIsEditing(false);
      // Cập nhật UI parent nếu cần
      onUpdateConversation &&
        onUpdateConversation({ ...selectedConversation, name: groupName });
    } catch (error) {
      console.error("Failed to update group name:", error);
    }
  };

  const handleCancel = () => {
    setGroupName(selectedConversation.name);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (selectedConversation.type === "group") {
      setIsEditing(true);
    }
  };

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
        src={selectedConversation.avatarUrl}
        sx={{ mr: 2, cursor: selectedConversation.type === "group" ? "pointer" : "default" }}
        onClick={handleEditClick}
      />
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <IconButton onClick={handleSave}>
            <CheckIcon />
          </IconButton>
          <IconButton onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography
          variant="h6"
          onClick={handleEditClick}
          sx={{ cursor: selectedConversation.type === "group" ? "pointer" : "default" }}
        >
          {selectedConversation.name}
        </Typography>
      )}
    </Box>
  );
};

export default ChatHeader;
