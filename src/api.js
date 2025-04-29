import axios from "axios";

const API = axios.create({
  baseURL: "https://kms-gstr-4-node-production.up.railway.app/api",
});

export default API;
