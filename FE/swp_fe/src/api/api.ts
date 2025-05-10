import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      if (accessToken !== "null") {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${JSON.parse(accessToken)}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, redirecting...");
    }
    return Promise.reject(error);
  }
);

export default api;
