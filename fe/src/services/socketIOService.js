// src/services/socketIOService.js
import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "../config/socketConfig";

class SocketIOService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.token = null;
    this.userId = null;
    this.listeners = new Map(); // Lưu trữ các listener để dễ dàng quản lý
  }

  // Khởi tạo kết nối socket
  connect(token, userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.token = token;
    this.userId = userId;

    // Tạo URL với token
    const connectionUrl = `${SOCKET_CONFIG.SERVER_URL}?token=${token}`;
    
    this.socket = io(connectionUrl, {
      ...SOCKET_CONFIG.CONNECTION_OPTIONS,
    });

    this.socket.on(SOCKET_CONFIG.EVENTS.CONNECT, () => {
      console.log("Socket.IO connected");
      this.connected = true;
      this.joinUser(userId);
    });

    this.socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, () => {
      console.log("Socket.IO disconnected");
      this.connected = false;
    });

    this.socket.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, (error) => {
      console.error("Socket.IO connection error:", error);
      this.connected = false;
    });

    return this.socket;
  }

  // Tham gia phòng người dùng
  joinUser(userId) {
    if (this.socket && this.connected) {
      this.socket.emit(SOCKET_CONFIG.EVENTS.JOIN_ROOM, userId);
    }
  }

  // Lắng nghe thông báo mới
  onNotification(callback) {
    this.addEventListener(SOCKET_CONFIG.EVENTS.NOTIFICATION, callback);
  }

  // Lắng nghe tin nhắn mới
  onMessage(callback) {
    this.addEventListener(SOCKET_CONFIG.EVENTS.MESSAGE, callback);
  }

  // Lắng nghe user online
  onUserOnline(callback) {
    this.addEventListener(SOCKET_CONFIG.EVENTS.USER_ONLINE, callback);
  }

  // Lắng nghe user offline
  onUserOffline(callback) {
    this.addEventListener(SOCKET_CONFIG.EVENTS.USER_OFFLINE, callback);
  }

  // Lắng nghe reaction
  onReaction(callback) {
    this.addEventListener("reaction", callback);
  }

  // Lắng nghe sự kiện tùy chỉnh với quản lý listener
  addEventListener(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Lưu listener để có thể remove sau này
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
    }
  }

  // Lắng nghe sự kiện tùy chỉnh (alias cho addEventListener)
  on(event, callback) {
    this.addEventListener(event, callback);
  }

  // Gửi sự kiện tùy chỉnh
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  // Ngừng lắng nghe sự kiện cụ thể
  removeEventListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove từ listeners map
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
        if (this.listeners.get(event).size === 0) {
          this.listeners.delete(event);
        }
      }
    }
  }

  // Ngừng lắng nghe sự kiện (alias cho removeEventListener)
  off(event, callback) {
    this.removeEventListener(event, callback);
  }

  // Ngừng lắng nghe tất cả sự kiện của một loại
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      // Clear all listeners
      this.listeners.forEach((callbacks, event) => {
        this.socket.removeAllListeners(event);
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.token = null;
      this.userId = null;
    }
  }

  // Kiểm tra trạng thái kết nối
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Lấy socket instance (dùng trong trường hợp đặc biệt)
  getSocket() {
    return this.socket;
  }

  // Lấy danh sách listeners hiện tại (để debug)
  getListeners() {
    return this.listeners;
  }
}

// Tạo instance singleton
const socketIOService = new SocketIOService();

export default socketIOService;
