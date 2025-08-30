import {
  Avatar,
  Drawer,
  Button,
  Input,
  Typography,
  List,
  Modal,
  Dropdown,
  Menu,
} from "antd";
import {
  CheckOutlined,
  UserOutlined,
  CloseOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  updateConversation,
  addUserToConversation,
  removeUserFromConversation,
} from "../../services/chatService";
import { getAllUsers, searchUsersByFullName } from "../../services/userService";
import { useState, useEffect } from "react";
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
  const [openAddMember, setOpenAddMember] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (openAddMember) {
        try {
          const res = await getAllUsers();
          let results = res.data?.result || [];
          const existingIds = selectedConversation.participants.map(
            (p) => p.userId
          );
          results = results.filter((user) => !existingIds.includes(user.id));
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      }
    };
    fetchUsers();
  }, [openAddMember]);

  const handleSearchUsers = async () => {
    if (!searchKeyword.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await searchUsersByFullName(searchKeyword);
      let results = res.data?.result || [];
      // Lọc bỏ các user đã có trong conversation
      const existingIds = selectedConversation.participants.map(
        (p) => p.userId
      );
      results = results.filter((user) => !existingIds.includes(user.id));
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleKickMember = (userId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa thành viên này?",
      content: "Thành viên sẽ không còn nhận được tin nhắn từ nhóm.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await removeUserFromConversation(selectedConversation.id, userId);

          // Cập nhật lại participants trong UI
          onUpdateConversation?.({
            ...selectedConversation,
            participants: selectedConversation.participants.filter(
              (p) => p.userId !== userId
            ),
          });
        } catch (error) {
          console.error("Failed to remove member:", error);
        }
      },
    });
  };

  const handleLeaveGroup = async () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn rời nhóm?",
      content: "Sau khi rời, bạn sẽ không còn nhận được tin nhắn từ nhóm này.",
      okText: "Rời nhóm",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const userId = localStorage.getItem("userId");
          if (!userId) {
            console.error("Không tìm thấy userId trong localStorage");
            return;
          }
          await removeUserFromConversation(selectedConversation.id, userId);
          onUpdateConversation?.(null); // Callback reload hoặc navigate ra ngoài
          setOpenDrawer(false);
        } catch (error) {
          console.error("Failed to leave group:", error);
        }
      },
    });
  };

  const handleAddMember = async (userId) => {
    try {
      await addUserToConversation(selectedConversation.id, userId);

      // Cập nhật lại participants trong UI
      const addedUser = searchResults.find((u) => u.id === userId);
      onUpdateConversation?.({
        ...selectedConversation,
        participants: [...selectedConversation.participants, addedUser],
      });

      // Xoá user vừa thêm khỏi searchResults
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

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
              renderItem={(member) => {
                const menu = (
                  <Menu>
                    <Menu.Item
                      key="kick"
                      danger
                      onClick={() => handleKickMember(member.userId)}
                    >
                      Xóa khỏi nhóm
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <List.Item
                    actions={[
                      <Dropdown overlay={menu} trigger={["click"]}>
                        <MoreOutlined
                          style={{ fontSize: 18, cursor: "pointer" }}
                        />
                      </Dropdown>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar src={member.avatar} icon={<UserOutlined />} />
                      }
                      title={
                        <Text>
                          {member.firstName + " " + member.lastName}
                        </Text>
                      }
                      description={
                        <Text type="secondary">{member.addedBy}</Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>

        {/* Thêm thành viên */}
        <Button
          block
          className="upload-btn"
          onClick={() => setOpenAddMember(true)}
        >
          <label>Thêm thành viên</label>
        </Button>

        <Drawer
          title="Thêm thành viên"
          placement="right"
          onClose={() => setOpenAddMember(false)}
          open={openAddMember}
          width={320}
        >
          <Input.Search
            placeholder="Nhập tên thành viên"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearchUsers}
            enterButton="Tìm"
            loading={loadingSearch}
          />

          <List
            style={{ marginTop: 15 }}
            dataSource={searchResults}
            locale={{ emptyText: "Không tìm thấy người dùng" }}
            renderItem={(user) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleAddMember(user.id)}
                  >
                    Thêm
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={user.avatarUrl} icon={<UserOutlined />} />
                  }
                  title={<Text>{user.firstName + " " + user.lastName}</Text>}
                />
              </List.Item>
            )}
          />
        </Drawer>

        {/* Rời nhóm */}
        <Button
          block
          danger
          style={{ marginTop: 10 }}
          onClick={handleLeaveGroup}
        >
          Rời nhóm chat
        </Button>
      </Drawer>
    </>
  );
};

export default ChatHeader;
