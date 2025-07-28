import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ImageIcon from "@mui/icons-material/Image";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import axios from "axios";
import "./styles.css";

const MessageInput = ({ message, onMessageChange, onSendMessage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const handleEmojiSelect = (emoji) => {
    onMessageChange(message + emoji.native);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const token = localStorage.getItem("token");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "http://localhost:8080/api/v1/upload/post-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.code === 1000) {
          const result = response.data.result;
          setUploadedFiles((prev) => [
            ...prev,
            {
              uid: file.uid || result.url,
              name: file.name,
              status: "done",
              url: result.url,
              contentType: file.type,
              fileName: file.name,
            },
          ]);
        } else {
          message.error("Tải ảnh thất bại");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        message.error("Có lỗi khi tải ảnh");
      }
    }
  };

  const handleRemoveFile = async (url) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.delete(
        "http://localhost:8080/api/v1/upload/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            imageUrl: url,
          },
        }
      );

      if (response.data.code === 1000) {
        setUploadedFiles((prev) => prev.filter((file) => file.url !== url));
        message.success("Xoá ảnh thành công");
      } else {
        message.error("Xoá ảnh thất bại");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() && uploadedFiles.length === 0) return;
    const mediaUrls = uploadedFiles.map((f) => f.url);
    onSendMessage({ message, mediaUrls });
    onMessageChange("");
    setUploadedFiles([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} className="message-form">
        {uploadedFiles.length > 0 && (
          <Stack direction="row" spacing={1} className="media-preview">
            {uploadedFiles.map((file, index) => {
              const isImage = file.contentType?.startsWith("image");

              return (
                <Box key={index} className="media-item">
                  {isImage && (
                    <>
                      <img
                        src={file.url}
                        alt="preview"
                        className="media-image"
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setViewImage(file.url)}
                      >
                        👁️
                      </span>
                      <IconButton
                        size="small"
                        className="remove-button"
                        onClick={() => handleRemoveFile(file.url)}
                      >
                        ✕
                      </IconButton>
                    </>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}

        <Box className="input-row">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <EmojiEmotionsIcon />
          </IconButton>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </Popover>

          <input
            accept="image/*,video/*"
            type="file"
            multiple
            hidden
            id="file-upload"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <IconButton component="span">
              <ImageIcon />
            </IconButton>
          </label>

          <TextField
            fullWidth
            placeholder="Aa"
            variant="outlined"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            multiline
            maxRows={4}
            className="input-spacing"
          />

          <IconButton
            color="primary"
            type="submit"
            disabled={!message.trim() && uploadedFiles.length === 0}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {viewImage && (
        <Box className="modal" onClick={() => setViewImage(null)}>
          <img src={viewImage} alt="zoom" className="modal-img" />
        </Box>
      )}
    </>
  );
};

export default MessageInput;
