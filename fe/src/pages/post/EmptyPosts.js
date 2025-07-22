import React from "react";
import { Card, Typography } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EmptyPosts = () => {
  return (
    <Card className="empty-posts">
      <div className="empty-content">
        <MessageOutlined className="empty-icon" />
        <Title level={4}>Chưa có bài viết nào</Title>
        <Text type="secondary">
          Hãy tạo bài viết đầu tiên của bạn!
        </Text>
      </div>
    </Card>
  );
};

export default EmptyPosts;