import axios from "axios";

/**
 * Central axios instance.
 * - Uses REACT_APP_API_BASE_URL if provided, otherwise falls back to your Render URL.
 * - Automatically attaches Bearer token (if present) for authenticated calls.
 */
const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL ||
    "https://kms-gstr-4-node.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ---------- Auth ----------
export const registerUser = (payload) => API.post("/auth/register", payload);
export const loginUser = (payload) => API.post("/auth/login", payload);

// (Optional example) role-protected route
export const getAdminDashboard = () => API.get("/auth/admin/dashboard");

export default API;
