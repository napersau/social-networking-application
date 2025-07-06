import React from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages }) => (
  <div className="messages-wrapper">
    {messages.map((msg) => (
      <MessageItem key={msg.id} msg={msg} />
    ))}
  </div>
);

export default MessageList;