import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NewChatPopover from "../../components/newChatPopover";
import { deleteConversation } from "../../services/chatService";

const ConversationList = ({
  conversations,
  loading,
  error,
  selectedConversation,
  onConversationSelect,
  onNewChatClick,
  onRefresh,
  onlineUsers,
  onSelectUser,
  onCreateGroup,
}) => {
  const currentUserId = localStorage.getItem("userId");
  const [openPopover, setOpenPopover] = React.useState(false);

  // state cho menu 3 chấm
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuConversationId, setMenuConversationId] = React.useState(null);

  const handleMenuOpen = (event, conversationId) => {
    setAnchorEl(event.currentTarget);
    setMenuConversationId(conversationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuConversationId(null);
  };

  const handleDeleteConversation = async () => {
    try {
      if (menuConversationId) {
        await deleteConversation(menuConversationId);
        onRefresh(); // reload danh sách sau khi xóa
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    } finally {
      handleMenuClose();
    }
  };

  return (
    <Box
      sx={{
        width: 300,
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">Chats</Typography>
        <NewChatPopover
          open={openPopover}
          onClose={() => setOpenPopover(false)}
          onSelectUser={(user) => {
            onSelectUser(user); // gọi callback để tạo conversation
            setOpenPopover(false);
          }}
          onCreateGroup={(groupData) => {
            const payload = {
              name: groupData.name,
              participantIds: groupData.members.map((m) => m.id),
            };
            onCreateGroup(payload); // gọi callback cha
            setOpenPopover(false);
          }}
        >
          <IconButton
            color="primary"
            size="small"
            onClick={() => setOpenPopover((prev) => !prev)}
            sx={{
              bgcolor: "primary.light",
              color: "white",
              "&:hover": { bgcolor: "primary.main" },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </NewChatPopover>
      </Box>

      {/* Conversations List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {(() => {
          if (loading) {
            return (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={28} />
              </Box>
            );
          }

          if (error) {
            return (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={onRefresh}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Box>
            );
          }

          if (!conversations || conversations.length === 0) {
            return (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No conversations yet. Start a new chat to begin.
                </Typography>
              </Box>
            );
          }

          return (
            <>
              <List sx={{ width: "100%", p: 0 }}>
                {conversations.map((conversation, index) => {
                  // Debug: ghi lại cấu trúc conversation để kiểm tra
                  console.log("Conversation:", conversation);
                  console.log("Online users:", onlineUsers);
                  
                  // Kiểm tra xem conversation có thuộc tính participants không
                  if (!conversation.participants || !Array.isArray(conversation.participants)) {
                    console.error("Invalid conversation structure:", conversation);
                    // Nếu không có participants, tạo mảng rỗng để tránh lỗi
                    conversation.participants = [];
                  }

                  // Với cuộc trò chuyện nhóm, sẽ có nhiều participants
                  // Với cuộc trò chuyện 1-1, lấy userId của người còn lại
                  let otherUserId;
                  let isOnline = false;

                  if (conversation.type === 'GROUP') {
                    // Cuộc trò chuyện nhóm: kiểm tra có bất kỳ thành viên nào đang online không
                    isOnline = conversation.participants.some(
                      (p) => p.userId !== currentUserId && onlineUsers?.includes(p.userId)
                    );
                  } else {
                    // Cuộc trò chuyện 1-1: lấy ID người dùng khác
                    const otherParticipant = conversation.participants.find(
                      (p) => p.userId !== currentUserId
                    );
                    otherUserId = otherParticipant?.userId;
                    isOnline = otherUserId && onlineUsers?.includes(otherUserId);
                  }
                  
                  console.log(`Conversation ${conversation.id} - ${conversation.name} - otherUserId: ${otherUserId} - isOnline: ${isOnline}`);
                  
                  return (
                    <React.Fragment key={conversation.id}>
                      <ListItem
                        alignItems="flex-start"
                        onClick={() => onConversationSelect(conversation)}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            selectedConversation?.id === conversation.id
                              ? "rgba(0, 0, 0, 0.04)"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.08)",
                          },
                        }}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={(e) =>
                              handleMenuOpen(e, conversation.id)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <Badge
                              color="error"
                              badgeContent={conversation.unread}
                              invisible={conversation.unread === 0}
                              overlap="circular"
                            >
                              <Avatar src={conversation.avatarUrl || ""} />
                            </Badge>

                            {/* 🔹 Chấm xanh báo online */}
                            {isOnline && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 2,
                                  right: 2,
                                  width: 10,
                                  height: 10,
                                  bgcolor: "#4caf50",
                                  borderRadius: "50%",
                                  border: "2px solid white",
                                }}
                              />
                            )}
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                noWrap
                                sx={{ display: "inline" }}
                              >
                                {conversation.name}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "inline",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {new Date(
                                  conversation.modifiedDate
                                ).toLocaleString("vi-VN", {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                })}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                              noWrap
                            >
                              {conversation.lastMessage ||
                                "Start a conversation"}
                            </Typography>
                          }
                          primaryTypographyProps={{
                            fontWeight:
                              conversation.unread > 0 ? "bold" : "normal",
                          }}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            pr: 1,
                          }}
                        />
                      </ListItem>
                      {index < conversations.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>

              {/* Menu 3 chấm */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleDeleteConversation}>
                  Xóa cuộc trò chuyện
                </MenuItem>
              </Menu>
            </>
          );
        })()}
      </Box>
    </Box>
  );
};

export default ConversationList;
