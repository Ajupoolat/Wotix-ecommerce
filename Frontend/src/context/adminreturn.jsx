import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

const WebSocketContext = createContext(null);

export const WebSocketProviderAdmin = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const baseurl = import.meta.env.VITE_API_URL

  useEffect(() => {
    const newSocket = io(baseurl, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {});

    newSocket.on("disconnect", () => {});

    newSocket.on("user_connected", (data) => {
      setConnectedUsers((prev) =>
        new Map(prev).set(data.userId, data.socketId)
      );
    });

    newSocket.on("user_disconnected", (userId) => {
      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    newSocket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(notification.message);
    });

    return () => newSocket.disconnect();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connectedUsers,
        notifications,
        unreadCount,
        markAsRead,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
