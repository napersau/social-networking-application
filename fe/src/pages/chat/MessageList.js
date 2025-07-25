import React, { forwardRef } from "react";
import { Box, Paper, Typography, Avatar, Stack } from "@mui/material";

const MessageList = forwardRef(({ messages }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // Important for flex scrolling
        padding: 2,
        // Custom scrollbar styling
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.2)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0,0,0,0.3)",
        },
      }}
    >
      {/* Messages container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minHeight: "min-content",
          paddingBottom: 1,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            // Extract background color logic
            let backgroundColor = "#f5f5f5"; // default for others
            if (msg.me) {
              backgroundColor = msg.failed ? "#ffebee" : "#e3f2fd";
            }

            return (
              <Box
                key={msg.id || `${msg.createdDate}-${msg.message}`}
                sx={{
                  display: "flex",
                  justifyContent: msg.me ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                {!msg.me && (
                  <Avatar
                    src={msg.sender?.avatar}
                    sx={{
                      mr: 1,
                      alignSelf: "flex-end",
                      width: 32,
                      height: 32,
                    }}
                  />
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    minWidth: "100px",
                    backgroundColor,
                    borderRadius: msg.me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    opacity: msg.pending ? 0.7 : 1,
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.4,
                    }}
                  >
                    {msg.message}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ mt: 1 }}
                  >
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
                    <Typography
                      variant="caption"
                      sx={{ 
                        display: "block", 
                        textAlign: "right",
                        color: "text.secondary",
                        fontSize: "0.7rem",
                      }}
                    >
                      {new Date(msg.createdDate).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </Typography>
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
  );
});

MessageList.displayName = "MessageList";

export default MessageList;