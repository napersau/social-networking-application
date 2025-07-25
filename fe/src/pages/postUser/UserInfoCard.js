import React from "react";
import { Card, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const UserInfoCard = ({ userInfo, postsCount }) => {
  if (!userInfo) return null;

  return (
    <Card className="user-info-card">
      <div className="user-info-header">
        <Avatar
          size={60}
          src={userInfo.avatarUrl}
          icon={<UserOutlined />}
        />
        <div className="user-info-content">
          <Title level={3}>
            {userInfo.firstName} {userInfo.lastName}
          </Title>
          <Text type="secondary">{postsCount} bài viết</Text>
        </div>
      </div>
    </Card>
  );
};

export default UserInfoCard;