import React, { useState, useEffect } from "react";
import { Input, List, Avatar, Spin, Popover } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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

  console.log(users)

  const content = (
    <div className="new-chat-popover">
      <Input
        placeholder="Search users by username..."
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="search-input"
      />
      <div className="user-list">
        {loading ? (
          <div className="loading-container">
            <Spin size="small" />
          </div>
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
                className="user-item"
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
      onOpenChange={onClose}
      trigger="click"
      placement="bottomRight"
    >
      <div />
    </Popover>
  );
};

export default NewChatPopover;