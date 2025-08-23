# WebSocket Service Documentation

## Tổng quan

Dự án đã được tách riêng service WebSocket để dễ dàng quản lý và tái sử dụng. Bao gồm:

1. `socketIOService.js` - Service chính quản lý Socket.IO
2. `useSocket.js` - Hook React để sử dụng WebSocket
3. `socketConfig.js` - Cấu hình cho WebSocket

## Cấu trúc File

```
src/
├── services/
│   ├── socketIOService.js      # Service chính cho Socket.IO
│   └── webSocketService.js     # Service cho STOMP (chat cũ)
├── hooks/
│   └── useSocket.js            # Hook React cho WebSocket
├── config/
│   └── socketConfig.js         # Cấu hình WebSocket
└── components/
    └── header/
        └── index.js            # Sử dụng hook useSocket
```

## Cách sử dụng

### 1. Trong Component (Recommended)

```javascript
import { useSocket } from '../../hooks/useSocket';

function MyComponent() {
  const { 
    initializeSocket, 
    onNotification, 
    onMessage,
    onUserOnline,
    onUserOffline,
    onReaction,
    emitEvent,
    isConnected 
  } = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = "user123";
    
    // Khởi tạo kết nối
    initializeSocket(token, userId);
    
    // Lắng nghe thông báo
    onNotification((notification) => {
      console.log("New notification:", notification);
    });
    
    // Lắng nghe tin nhắn
    onMessage((message) => {
      console.log("New message:", message);
    });
    
  }, [initializeSocket, onNotification, onMessage]);

  return <div>My Component</div>;
}
```

### 2. Sử dụng Service trực tiếp

```javascript
import socketIOService from '../services/socketIOService';

// Kết nối
socketIOService.connect(token, userId);

// Lắng nghe sự kiện
socketIOService.onNotification((data) => {
  console.log("Notification:", data);
});

// Gửi sự kiện
socketIOService.emit("custom_event", { data: "example" });

// Ngắt kết nối
socketIOService.disconnect();
```

## API Reference

### SocketIOService

#### Methods

- `connect(token, userId)` - Khởi tạo kết nối
- `disconnect()` - Ngắt kết nối
- `joinUser(userId)` - Tham gia phòng người dùng
- `onNotification(callback)` - Lắng nghe thông báo
- `onMessage(callback)` - Lắng nghe tin nhắn
- `onUserOnline(callback)` - Lắng nghe user online
- `onUserOffline(callback)` - Lắng nghe user offline
- `onReaction(callback)` - Lắng nghe reaction
- `addEventListener(event, callback)` - Lắng nghe sự kiện tùy chỉnh
- `removeEventListener(event, callback)` - Xóa listener
- `removeAllListeners(event)` - Xóa tất cả listeners
- `emit(event, data)` - Gửi sự kiện
- `isConnected()` - Kiểm tra trạng thái kết nối

### useSocket Hook

#### Returns

```javascript
{
  initializeSocket: (token, userId) => void,
  onNotification: (callback) => void,
  onMessage: (callback) => void,
  onUserOnline: (callback) => void,
  onUserOffline: (callback) => void,
  onReaction: (callback) => void,
  addEventListener: (event, callback) => void,
  removeEventListener: (event, callback) => void,
  removeAllListeners: (event) => void,
  emitEvent: (event, data) => void,
  isConnected: () => boolean,
  getSocket: () => Socket,
  disconnect: () => void,
}
```

## Cấu hình

File `config/socketConfig.js` chứa tất cả cấu hình:

```javascript
export const SOCKET_CONFIG = {
  SERVER_URL: "http://localhost:9092",
  CONNECTION_OPTIONS: {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    // ... other options
  },
  EVENTS: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    NOTIFICATION: "notification",
    MESSAGE: "message",
    // ... other events
  }
};
```

## Ví dụ Migration

### Trước (trong Header component):

```javascript
// Cũ - code dài và khó quản lý
const socket = io("http://localhost:9092", {
  transports: ["websocket"],
  query: { token: token }
});

socket.emit("join", userId);
socket.on("notification", (data) => {
  // handle notification
});
```

### Sau (sử dụng hook):

```javascript
// Mới - gọn gàng và dễ quản lý
const { initializeSocket, onNotification } = useSocket();

useEffect(() => {
  initializeSocket(token, userId);
  onNotification((data) => {
    // handle notification
  });
}, [initializeSocket, onNotification]);
```

## Lợi ích

1. **Tái sử dụng**: Service có thể dùng ở nhiều component
2. **Quản lý tập trung**: Tất cả logic WebSocket ở một chỗ
3. **Dễ bảo trì**: Thay đổi cấu hình chỉ cần sửa một file
4. **Type Safety**: Có thể thêm TypeScript dễ dàng
5. **Cleanup tự động**: Hook tự động cleanup khi component unmount
6. **Singleton Pattern**: Một instance duy nhất cho toàn app

## Migration Guide

Để migrate từ code cũ:

1. Import hook: `import { useSocket } from '../../hooks/useSocket'`
2. Thay thế logic Socket.IO bằng hook
3. Remove import `io` từ socket.io-client
4. Update useEffect dependencies
5. Test functionality

## Troubleshooting

- Kiểm tra console để xem log kết nối
- Sử dụng `isConnected()` để check trạng thái
- Đảm bảo cleanup listeners khi không cần
- Check network tab để xem WebSocket connection
