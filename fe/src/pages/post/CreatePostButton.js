import React from "react";
import { Card, Button, Avatar } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";

const CreatePostButton = ({ userAvatar, onClick }) => {
  return (
    <Card className="create-post-card">
      <div className="create-post-header">
        <Avatar
          size={40}
          src={userAvatar}
          icon={<UserOutlined />}
        />
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onClick}
          className="create-post-button"
        >
          Tạo bài viết mới
        </Button>
      </div>
    </Card>
  );
};

export default CreatePostButton;