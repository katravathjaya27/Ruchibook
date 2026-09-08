import axios from "axios";

// The backend URL. Reads from VITE_API_URL (set this in frontend/.env
// for local overrides, or in your hosting provider's environment
// variables when deployed) and falls back to localhost for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT token (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ruchibook_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
