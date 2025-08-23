// src/config/socketConfig.js

// Cấu hình cho Socket.IO
export const SOCKET_CONFIG = {
  // URL server Socket.IO
  SERVER_URL: process.env.REACT_APP_SOCKET_URL || "http://localhost:9092",
  
  // Các tuỳ chọn kết nối
  CONNECTION_OPTIONS: {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  },
  
  // Các sự kiện Socket
  EVENTS: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",
    NOTIFICATION: "notification",
    MESSAGE: "message",
    TYPING: "typing",
    JOIN_ROOM: "join",
    LEAVE_ROOM: "leave",
    USER_ONLINE: "user_online",
    USER_OFFLINE: "user_offline",
  },
  
  // Các phòng/kênh
  ROOMS: {
    USER_NOTIFICATIONS: (userId) => `user_${userId}_notifications`,
    USER_MESSAGES: (userId) => `user_${userId}_messages`,
    CHAT_ROOM: (roomId) => `chat_${roomId}`,
  },
};

// Cấu hình cho STOMP WebSocket (chat)
export const STOMP_CONFIG = {
  SERVER_URL: process.env.REACT_APP_STOMP_URL || "http://localhost:8080/ws",
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 4000,
  HEARTBEAT_OUTGOING: 4000,
  
  ENDPOINTS: {
    SEND_MESSAGE: "/app/chat.sendMessage",
    ADD_USER: "/app/chat.addUser",
    TYPING: "/app/chat.typing",
    
    SUBSCRIBE_MESSAGES: "/user/queue/messages",
    SUBSCRIBE_TYPING: "/user/queue/typing",
    SUBSCRIBE_ERRORS: "/user/queue/errors",
  },
};

export default {
  SOCKET_CONFIG,
  STOMP_CONFIG,
};
