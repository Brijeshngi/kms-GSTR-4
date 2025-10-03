import axios from "axios";

const API = axios.create({
  baseURL: "https://kms-gstr-4-node.onrender.com/api",
});

export const addFirm = (firm) => axios.post(`${API}/firms/add`, firm);
export const getFirms = () => axios.get(API);
export const updateFirm = (id, firm) => axios.put(`${API}/${id}`, firm);
export const deleteFirm = (id) => axios.delete(`${API}/${id}`);

export default API;
