import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socketInstance = io("https://wotix.myftp.org", {
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ socket, notifications, setNotifications }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
