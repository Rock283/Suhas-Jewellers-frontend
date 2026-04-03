import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const adminApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jv_admin_token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
