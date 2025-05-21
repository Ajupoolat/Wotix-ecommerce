import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

//creating the instance of api call

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

//if there is any issue in request it will show
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error(`Request error : ${error}`);

    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    if (error.response?.status === 401) {
      console.warn("Unautherized access - redrecting to login");
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
