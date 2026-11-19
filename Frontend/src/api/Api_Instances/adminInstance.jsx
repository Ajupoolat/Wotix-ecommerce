import axios from "axios";

const API_URL_ADMIN = import.meta.env.VITE_API_URL_ADMIN || "/api/admin";
const apiAdmin = axios.create({
  baseURL: API_URL_ADMIN,
  withCredentials: true,
});

apiAdmin.interceptors.response.use(
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

export default apiAdmin;
