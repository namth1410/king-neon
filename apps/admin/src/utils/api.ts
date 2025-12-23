import axios from "axios";
import { ErrorCode } from "@king-neon/shared";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Check if running on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error format
    const customError = {
      message:
        error.response?.data?.message || error.message || "Unknown error",
      code: error.response?.data?.code || ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: error.response?.status,
      originalError: error,
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isLoginPage = window.location.pathname === "/login";
        if (!isLoginPage) {
          localStorage.removeItem("admin_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
