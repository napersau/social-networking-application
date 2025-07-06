import React from "react";
import { Avatar, Card, Typography } from "antd";

const { Text } = Typography;

const MessageItem = ({ msg }) => (
  <div className={`message-item ${msg.me ? "own-message" : ""}`}>
    {!msg.me && (
      <Avatar src={msg.sender?.avatar} size="small" className="message-avatar" />
    )}
    <Card
      className={`message-card ${msg.me ? "own-message-card" : ""} ${
        msg.failed ? "failed-message" : ""
      } ${msg.pending ? "pending-message" : ""}`}
      variant="outlined"
    >
      <Text>{msg.message}</Text>
      <div className="message-footer">
        {msg.failed && <Text type="danger">Failed to send</Text>}
        {msg.pending && <Text type="secondary">Sending...</Text>}
        <Text type="secondary" className="message-time">
          {new Date(msg.createdDate).toLocaleString()}
        </Text>
      </div>
    </Card>
    {msg.me && <Avatar className="message-avatar own-avatar">You</Avatar>}
  </div>
);

export default MessageItem;