import React, { useState } from "react";
import { 
  Input, 
  Button, 
  Upload, 
  Popover, 
  Space, 
  Image,
  message as antMessage 
} from "antd";
import {
  SendOutlined,
  SmileOutlined,
  PictureOutlined,
  CloseCircleFilled,
  EyeOutlined,
} from "@ant-design/icons";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import axios from "axios";
import "./MessageInput.css";

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

    console.log("Files selected:", files);

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

        console.log("Upload response:", response.data);

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
          console.log("File uploaded successfully:", result.url);
        } else {
          console.error("Upload failed:", response.data);
          alert("Tải ảnh thất bại");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Có lỗi khi tải ảnh");
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
        antMessage.success("Xoá ảnh thành công");
      } else {
        antMessage.error("Xoá ảnh thất bại");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    const messageText = message?.trim() || '';
    const validFiles = uploadedFiles.filter(file => 
      file && file.url && file.status === 'done'
    );
    const mediaUrls = validFiles.map(f => f.url);

    if (!messageText && mediaUrls.length === 0) {
      console.log('No content to send');
      return;
    }
    const messageData = {
      message: messageText || null, // Send null instead of empty string
      mediaUrls: mediaUrls
    };
    console.log('Final message data being sent:', messageData);
    
    try {
      onSendMessage(messageData);
      onMessageChange("");
      setUploadedFiles([]);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        {/* Media Preview */}
        {uploadedFiles.length > 0 && (
          <div className="media-preview-container">
            <Space wrap size={8}>
              {uploadedFiles.map((file, index) => {
                const isImage = file.contentType?.startsWith("image");
                return (
                  isImage && (
                    <div key={index} className="media-preview-item">
                      <Image
                        src={file.url}
                        alt="preview"
                        width={80}
                        height={80}
                        style={{ 
                          borderRadius: 8, 
                          objectFit: 'cover',
                          cursor: 'pointer' 
                        }}
                        preview={{
                          mask: <EyeOutlined style={{ fontSize: 20 }} />,
                        }}
                      />
                      <CloseCircleFilled
                        className="remove-icon"
                        onClick={() => handleRemoveFile(file.url)}
                      />
                    </div>
                  )
                );
              })}
            </Space>
          </div>
        )}

        {/* Input Area */}
        <div className="input-wrapper">
          <Space.Compact className="input-controls">
            {/* Emoji Picker */}
            <Popover
              content={<Picker data={data} onEmojiSelect={handleEmojiSelect} />}
              trigger="click"
              placement="topLeft"
              open={Boolean(anchorEl)}
              onOpenChange={(visible) => setAnchorEl(visible ? {} : null)}
            >
              <Button
                type="text"
                icon={<SmileOutlined style={{ fontSize: 20 }} />}
                className="action-button emoji-button"
              />
            </Popover>

            {/* Image Upload */}
            <input
              accept="image/*,video/*"
              type="file"
              multiple
              hidden
              id="file-upload-input"
              onChange={handleFileChange}
              ref={(input) => {
                if (input) {
                  window.fileInputRef = input;
                }
              }}
            />
            <Button
              type="text"
              icon={<PictureOutlined style={{ fontSize: 20 }} />}
              className="action-button image-button"
              onClick={() => document.getElementById('file-upload-input').click()}
            />

            {/* Text Input */}
            <Input.TextArea
              placeholder="Aa"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="message-textarea"
              bordered={false}
            />

            {/* Send Button */}
            <Button
              type="primary"
              icon={<SendOutlined style={{ fontSize: 18 }} />}
              onClick={handleSubmit}
              disabled={!message.trim() && uploadedFiles.length === 0}
              className="send-button"
              shape="circle"
              size="large"
            />
          </Space.Compact>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
