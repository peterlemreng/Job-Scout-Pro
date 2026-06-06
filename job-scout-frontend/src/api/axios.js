import axios from "axios";

const api = axios.create({
  baseURL: "https://job-scout-pro-backend-production.up.railway.app/api"
});

export default api;

