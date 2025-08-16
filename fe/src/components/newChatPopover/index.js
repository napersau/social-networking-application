import React, { useState, useEffect } from "react";
import { Input, List, Avatar, Spin, Popover, Button } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { searchUsers } from "../../services/userService";
import "./styles.css";

const NewChatPopover = ({ open, onClose, onSelectUser, onCreateGroup, children }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchKeyword.trim()) return setUsers([]);
      setLoading(true);
      searchUsers(searchKeyword)
        .then((res) => setUsers(res?.data?.result || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchKeyword]);

  const toggleSelectUser = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = () => {
    if (selectedUsers.length === 1) {
      // Nếu chỉ chọn 1 user → chat 1-1
      onSelectUser(selectedUsers[0]);
    } else if (selectedUsers.length > 1) {
      // Nếu nhiều user → tạo group
      onCreateGroup({ name: groupName, members: selectedUsers });
    }
    onClose();
    setSearchKeyword("");
    setUsers([]);
    setSelectedUsers([]);
    setGroupName("");
  };

  const content = (
    <div className="new-chat-popover">
      <Input
        placeholder="Search users by username..."
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
      <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: 10 }}>
        {loading ? (
          <Spin />
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => {
              const selected = selectedUsers.find((u) => u.id === user.id);
              return (
                <List.Item
                  style={{
                    background: selected ? "#e6f7ff" : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleSelectUser(user)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={user.avatarUrl}
                        icon={!user.avatarUrl && <UserOutlined />}
                      />
                    }
                    title={user.displayName}
                    description={user.username}
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {/* Nếu chọn nhiều user thì nhập tên nhóm */}
      {selectedUsers.length > 1 && (
        <Input
          placeholder="Group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{ marginTop: 10 }}
        />
      )}

      {selectedUsers.length > 0 && (
        <Button
          type="primary"
          block
          style={{ marginTop: 10 }}
          onClick={handleCreate}
        >
          {selectedUsers.length > 1 ? "Create Group Chat" : "Start Chat"}
        </Button>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title="Start New Chat"
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose();
          setSearchKeyword("");
          setUsers([]);
          setSelectedUsers([]);
          setGroupName("");
        }
      }}
      trigger="click"
      placement="bottomLeft"
    >
      {children}
    </Popover>
  );
};

export default NewChatPopover;
