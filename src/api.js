import axios from "axios";

const API = axios.create({
  baseURL: "https://kms-gstr-4-node.onrender.com/api",
});

// ➕ Add Firm
export const addFirm = (data) => API.post("/firms/add", data);

// 📃 Get All Firms
export const getFirms = () => API.get("/firms");

// 🔍 Get Firm by ID
export const getFirm = (id) => API.get(`/firms/${id}`);

// ✏️ Update Firm
export const updateFirm = (id, data) => API.put(`/firms/${id}`, data);

// ❌ Delete Firm
export const deleteFirm = (id) => API.delete(`/firms/${id}`);

export default API;
