import React, { forwardRef, useState } from "react";
import { Box, Paper, Typography, Avatar, Stack, Dialog } from "@mui/material";
import { recallMessage } from "../../services/chatService"; // 👈 Thêm import

const MessageList = forwardRef(({ messages, setMessages }, ref) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleRecall = async (messageId) => {
    try {
      const response = await recallMessage(messageId);
      const isRecalled = response.data.result;

      const updatedMessages = messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              message: "[Tin nhắn đã thu hồi]",
              mediaList: [],
              isRecalled: true,
            }
          : msg
      );
      setMessages(updatedMessages); // 👈 cập nhật tin nhắn
    } catch (error) {
      console.error("Thu hồi tin nhắn thất bại:", error);
    }
  };

  return (
    <>
      <Box ref={ref} className="message-list-container">
        <Box className="messages-wrapper">
          {messages.length === 0 ? (
            <Box className="empty-message">
              <Typography variant="body2">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              let backgroundColor = "#f5f5f5";
              if (msg.me) backgroundColor = msg.failed ? "#ffebee" : "#e3f2fd";

              return (
                <Box
                  key={msg.id || `${msg.createdDate}-${msg.message}`}
                  className={`message-row ${msg.me ? "me" : "other"}`}
                >
                  {!msg.me && (
                    <Avatar
                      src={msg.sender?.avatar}
                      sx={{ mr: 1, alignSelf: "flex-end", width: 32, height: 32 }}
                    />
                  )}

                  <Paper
                    elevation={1}
                    className={`message-bubble ${msg.me ? "me" : "other"} ${
                      msg.pending ? "pending" : ""
                    }`}
                    style={{ backgroundColor }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (msg.me && !msg.failed && !msg.isRecalled) {
                        if (window.confirm("Bạn có chắc muốn thu hồi tin nhắn này?")) {
                          handleRecall(msg.id);
                        }
                      }
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.4,
                        fontStyle: msg.isRecalled ? "italic" : "normal",
                        color: msg.isRecalled ? "gray" : "inherit",
                      }}
                    >
                      {msg.isRecalled ? "[Tin nhắn đã thu hồi]" : msg.message}
                    </Typography>

                    {!msg.isRecalled && msg.mediaList?.length > 0 && (
                      <Box className="image-gallery">
                        {msg.mediaList.map((media, index) =>
                          media.type.startsWith("image") ? (
                            <Box
                              key={index}
                              component="img"
                              src={media.url}
                              alt={`media-${index}`}
                              onClick={() => setSelectedImage(media.url)}
                              className="message-image"
                            />
                          ) : null
                        )}
                      </Box>
                    )}

                    <Stack className="timestamp-stack">
                      {msg.failed && (
                        <Typography variant="caption" color="error">
                          Failed to send
                        </Typography>
                      )}
                      {msg.pending && (
                        <Typography variant="caption" color="text.secondary">
                          Sending...
                        </Typography>
                      )}
                      <Typography variant="caption" className="timestamp-text">
                        {new Date(msg.createdDate).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Typography>

                      {/* Nút thu hồi (click được nếu chưa bị recall) */}
                      {msg.me && !msg.isRecalled && !msg.failed && (
                        <Typography
                          variant="caption"
                          className="recall-text"
                          onClick={() => handleRecall(msg.id)}
                          sx={{ cursor: "pointer", color: "#f44336", mt: 0.5 }}
                        >
                          Thu hồi
                        </Typography>
                      )}
                    </Stack>
                  </Paper>

                  {msg.me && (
                    <Avatar
                      sx={{
                        ml: 1,
                        alignSelf: "flex-end",
                        width: 32,
                        height: 32,
                        bgcolor: "#1976d2",
                        fontSize: "0.75rem",
                      }}
                    >
                      You
                    </Avatar>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <Box
          component="img"
          src={selectedImage}
          alt="Preview"
          sx={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Dialog>
    </>
  );
});

MessageList.displayName = "MessageList";
export default MessageList;
