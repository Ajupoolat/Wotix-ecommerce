import axios from "axios";
const API_BASE_URL_USER = import.meta.env.VITE_API_URL_USER || "/userapi/user";

const apiUser = axios.create({
  baseURL: API_BASE_URL_USER,
  withCredentials: true,
});

apiUser.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiUser.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiUser;
