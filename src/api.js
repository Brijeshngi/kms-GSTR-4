import axios from "axios";

const API = axios.create({
  baseURL: "https://kms-gstr-4-node.onrender.com/api",
});

export default API;
