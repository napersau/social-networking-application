// ✅ NewChatPopover.js
import React, { useState, useEffect } from "react";
import { Input, List, Avatar, Spin, Popover, Button } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { searchUsers } from "../../services/userService";
import "./styles.css";

const NewChatPopover = ({ open, onClose, onSelectUser }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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
            renderItem={(user) => (
              <List.Item
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                  setSearchKeyword("");
                  setUsers([]);
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar src={user.avatarUrl} />}
                  title={user.displayName}
                  description={`@${user.username}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Start New Chat"
      open={open}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
      trigger="click"
      placement="bottomLeft"
    >
      {/* Trigger phải là phần tử có thể hiển thị */}
      <Button icon={<UserAddOutlined />} type="text" />
    </Popover>
  );
};

export default NewChatPopover;
