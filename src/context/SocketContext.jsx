import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getToken, getCurrentUser } from "../lib/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const currentUser = getCurrentUser();
  const token = getToken();

  useEffect(() => {
    if (!token || !currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const newSocket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🟢 Connected to Real-time Chat Socket:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("get_online_users", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, currentUser?.id, currentUser?.regNo]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null, onlineUsers: [], isConnected: false };
  }
  return context;
}
