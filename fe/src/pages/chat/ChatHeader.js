import React, { useState } from "react";
import { Avatar, Drawer, Button, Input, Typography } from "antd";
import { CheckOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { updateConversation } from "../../services/chatService";
import "./ChatHeader.css";

const { Title, Text } = Typography;

const ChatHeader = ({ selectedConversation, onUpdateConversation }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(selectedConversation?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(
    selectedConversation?.avatarUrl || ""
  );

  if (!selectedConversation) return null;

  const handleSaveName = async () => {
    try {
      await updateConversation(selectedConversation.id, { name: groupName });
      setIsEditingName(false);
      onUpdateConversation?.({ ...selectedConversation, name: groupName });
    } catch (error) {
      console.error("Failed to update group name:", error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newUrl = URL.createObjectURL(file);
    setAvatarUrl(newUrl);

    try {
      await updateConversation(selectedConversation.id, { avatarUrl: newUrl });
      onUpdateConversation?.({ ...selectedConversation, avatarUrl: newUrl });
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <Avatar
          src={selectedConversation.avatarUrl}
          size={40}
          icon={!selectedConversation.avatarUrl && <UserOutlined />}
          className={selectedConversation.type === "GROUP" ? "clickable" : ""}
          onClick={() =>
            selectedConversation.type === "GROUP" && setOpenDrawer(true)
          }
        />
        <Title
          level={5}
          className={selectedConversation.type === "GROUP" ? "clickable" : ""}
          onClick={() =>
            selectedConversation.type === "GROUP" && setOpenDrawer(true)
          }
        >
          {selectedConversation.name}
        </Title>
      </div>

      {/* Drawer sidebar */}
      <Drawer
        title="Tuỳ chỉnh đoạn chat"
        placement="right"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width={320}
      >
        <div className="drawer-content">
          <Avatar
            src={selectedConversation.avatarUrl || undefined}
            size={80}
            icon={!selectedConversation.avatarUrl && <UserOutlined />}
          />
          <Title level={4}>{selectedConversation.name}</Title>
        </div>

        {/* Đổi tên (chỉ cho GROUP) */}
        {selectedConversation.type === "GROUP" && (
          <>
            {isEditingName ? (
              <div className="edit-row">
                <Input
                  size="middle"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSaveName}
                />
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => setIsEditingName(false)}
                />
              </div>
            ) : (
              <Button block onClick={() => setIsEditingName(true)}>
                Đổi tên đoạn chat
              </Button>
            )}
          </>
        )}

        {/* Thay đổi ảnh */}
        <Button block className="upload-btn">
          <label htmlFor="upload-avatar">Thay đổi ảnh</label>
          <input
            id="upload-avatar"
            type="file"
            hidden
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </Button>
      </Drawer>
    </>
  );
};

export default ChatHeader;
