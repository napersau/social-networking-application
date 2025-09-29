import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getToken } from "../services/localStorageService";

const OnlineUsersContext = createContext();

export function OnlineUsersProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection only once
    const token = getToken();
    if (token && !socketRef.current) {
      console.log("Initializing socket connection in OnlineUsersContext...");

      const connectionUrl = "http://localhost:9092?token=" + token;
      socketRef.current = new io(connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected in OnlineUsersContext");
        
        // Gửi yêu cầu lấy danh sách người dùng online khi kết nối thành công
        socketRef.current.emit("get_online_users");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected in OnlineUsersContext");
      });

      // Nhận danh sách người dùng online từ server
      socketRef.current.on("online_users_list", (users) => {
        console.log("Received online users list:", users);
        if (Array.isArray(users)) {
          setOnlineUsers(users);
        }
      });

      // 🔹 Khi có user online
      socketRef.current.on("user_online", (userId) => {
        console.log("User online:", userId);
        setOnlineUsers((prev) => [...new Set([...prev, userId])]); // thêm nếu chưa có
      });

      // 🔹 Khi có user offline
      socketRef.current.on("user_offline", (userId) => {
        console.log("User offline:", userId);
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });
      
      // Tạo interval để refresh danh sách người dùng online
      const interval = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          console.log("Refreshing online users list");
          socketRef.current.emit("get_online_users");
        }
      }, 30000); // 30 giây refresh một lần
      
      return () => clearInterval(interval);
    }

    // Cleanup function - disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket in OnlineUsersContext...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineUsers() {
  return useContext(OnlineUsersContext);
}
