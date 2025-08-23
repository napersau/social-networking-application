import { Avatar, Drawer, Button, Input, Typography, List } from "antd";
import { CheckOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { updateConversation } from "../../services/chatService";
import { useState } from "react";
import axios from "axios";
import "./ChatHeader.css";

const { Title, Text } = Typography;

const ChatHeader = ({ selectedConversation, onUpdateConversation }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(selectedConversation?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(
    selectedConversation?.avatarUrl || ""
  );
  const [showMembers, setShowMembers] = useState(false);

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
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
      const newUrl = response.data.result.url;

      if (!newUrl) throw new Error("Upload failed");

      await updateConversation(selectedConversation.id, { avatarUrl: newUrl });

      setAvatarUrl(newUrl);
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

        {/* Đổi tên group */}
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

        {/* Danh sách thành viên */}
        <div style={{ marginTop: 20 }}>
          <Button
            block
            onClick={() => setShowMembers(!showMembers)}
            style={{ textAlign: "left" }}
          >
            Thành viên trong đoạn chat (
            {selectedConversation.participants?.length || 0})
          </Button>

          {showMembers && (
            <List
              style={{ marginTop: 10 }}
              itemLayout="horizontal"
              dataSource={selectedConversation.participants || []}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={member.avatar} icon={<UserOutlined />} />
                    }
                    title={
                      <Text>{member.firstName + " " + member.lastName}</Text>
                    }
                    description={<Text type="secondary">{member.addedBy}</Text>}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Drawer>
    </>
  );
};

export default ChatHeader;
