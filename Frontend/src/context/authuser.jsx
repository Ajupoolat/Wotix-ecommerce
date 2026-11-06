import { createContext, useContext, useState, useEffect } from "react";
import apiUser from "@/api/Api_Instances/userInstance";
import { logoutuser } from "@/api/users/signup/signupcall";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
    setSocket(newSocket);
    window.socket = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const googleUserId = searchParams.get("id");
      const success = searchParams.get("success");
      const googleToken = searchParams.get("token");

      if (googleToken) {
        localStorage.setItem("token", googleToken);
      }

      if (success === "true" && googleUserId) {
        const response = await apiUser.get('/verifyuser');

        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", googleUserId);
        localStorage.setItem("email", response.data.user.email);
        setUserId(googleUserId);

        if (socket) {
          socket.connect();
          socket.emit("register_user", googleUserId);

          socket.on("account_blocked", () => {
            handleForcedLogout();
            toast.error("Your account has been blocked by admin", {
              duration: 5000,
            });
            setTimeout(() => navigate("/login"), 3000);
          });
        }
      } else {
        const response = await apiUser.get('/verifyuser');

        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        const userId = response.data.user._id;
        const username = response.data.user.firstName;

        setUserId(userId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        localStorage.setItem("email", response.data.user.email);

        if (socket) {
          socket.connect();
          socket.emit("register_user", userId);

          socket.on("account_blocked", () => {
            handleForcedLogout();
            toast.error("Your account has been blocked by admin", {
              duration: 5000,
            });
            setTimeout(() => navigate("/login"), 3000);
          });
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userId");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiUser.post('/login', credentials);

      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      const username = response.data.userfind.firstName;
      const userId = response.data.userfind._id;
      const email = response.data.userfind.email;

      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
      localStorage.setItem("email", email);
      setUserId(userId);

      if (socket) {
        socket.connect();
        socket.emit("register_user", userId);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      throw new Error(errorMessage);
    }
  };

  const handleForcedLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    window.location.href = "/login";
    if (socket) {
      socket.disconnect();
    }
  };

  const logoutMutation = useMutation({
    mutationFn: logoutuser,
    onSuccess: () => {
      handleForcedLogout();
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      toast.success("Logged out successfully!");
      // navigate('/login')
      window.location.href = "/login";
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  useEffect(() => {
    checkAuthStatus();
  }, [searchParams]);

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout: logoutMutation.mutate,
    userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
