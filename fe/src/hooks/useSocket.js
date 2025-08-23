// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react';
import socketIOService from '../services/socketIOService';

export const useSocket = () => {
  const isInitialized = useRef(false);

  // Khởi tạo socket với token và userId
  const initializeSocket = useCallback((token, userId) => {
    if (!isInitialized.current) {
      socketIOService.connect(token, userId);
      isInitialized.current = true;
    }
  }, []);

  // Lắng nghe thông báo
  const onNotification = useCallback((callback) => {
    socketIOService.onNotification(callback);
  }, []);

  // Lắng nghe tin nhắn
  const onMessage = useCallback((callback) => {
    socketIOService.onMessage(callback);
  }, []);

  // Lắng nghe user online
  const onUserOnline = useCallback((callback) => {
    socketIOService.onUserOnline(callback);
  }, []);

  // Lắng nghe user offline
  const onUserOffline = useCallback((callback) => {
    socketIOService.onUserOffline(callback);
  }, []);

  // Lắng nghe reaction
  const onReaction = useCallback((callback) => {
    socketIOService.onReaction(callback);
  }, []);

  // Lắng nghe sự kiện tùy chỉnh
  const addEventListener = useCallback((event, callback) => {
    socketIOService.addEventListener(event, callback);
  }, []);

  // Gửi sự kiện
  const emitEvent = useCallback((event, data) => {
    socketIOService.emit(event, data);
  }, []);

  // Xóa listener
  const removeEventListener = useCallback((event, callback) => {
    socketIOService.removeEventListener(event, callback);
  }, []);

  // Xóa tất cả listeners của một sự kiện
  const removeAllListeners = useCallback((event) => {
    socketIOService.removeAllListeners(event);
  }, []);

  // Kiểm tra trạng thái kết nối
  const isConnected = useCallback(() => {
    return socketIOService.isConnected();
  }, []);

  // Lấy socket instance
  const getSocket = useCallback(() => {
    return socketIOService.getSocket();
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        socketIOService.disconnect();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    initializeSocket,
    onNotification,
    onMessage,
    onUserOnline,
    onUserOffline,
    onReaction,
    addEventListener,
    removeEventListener,
    removeAllListeners,
    emitEvent,
    isConnected,
    getSocket,
    disconnect: socketIOService.disconnect.bind(socketIOService),
  };
};

export default useSocket;
