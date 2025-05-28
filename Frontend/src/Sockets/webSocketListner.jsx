import { useEffect } from "react";
import io from 'socket.io-client';
import { useAuth } from "../context/authuser";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const WebSocketListener = () => {
  const { isAuthenticated, logout, userId } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL


  useEffect(() => {
    if (!isAuthenticated || !userId) return;

  const socket = io(baseUrl,{
    
  withCredentials: true,
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
    socket.emit('register_user', userId);

    // Handle account blocked event
    socket.on('account_blocked', () => {
      toast.error("Your account has been blocked by admin", {
        duration: 5000,
      });
      logout();
      navigate("/login");
    });

    // Handle connection events
    socket.on('connect', () => {
    });

    socket.on('disconnect', () => {
    });

    return () => {
      socket.off('account_blocked');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [isAuthenticated, userId, logout, navigate]);

  return null; 
};

export default WebSocketListener;