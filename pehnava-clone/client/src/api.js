import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || /*"http://localhost:5000/api"*/ "https://kashmirclothstores-1.onrender.com/";

export const api = axios.create({ baseURL: API_URL });

export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("pehnava_admin_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("pehnava_admin_token");
  }
}

const savedToken = localStorage.getItem("pehnava_admin_token");
if (savedToken) setAdminToken(savedToken);

export const INSTAGRAM_USERNAME =
  import.meta.env.VITE_INSTAGRAM_USERNAME || "your_instagram_username";
