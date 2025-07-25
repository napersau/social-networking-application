import React from "react";
import { Card, Typography } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EmptyPosts = () => {
  return (
    <Card className="empty-posts">
      <div className="empty-content">
        <MessageOutlined className="empty-icon" />
        <Title level={4}>Người dùng chưa có bài viết nào</Title>
        <Text type="secondary">
          Chưa có bài viết nào được đăng bởi người dùng này.
        </Text>
      </div>
    </Card>
  );
};

export default EmptyPosts;