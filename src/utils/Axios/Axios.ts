import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Change this to your API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


instance.interceptors.request.use(
  (config: any) => {
    let token = localStorage.getItem("token") || "";

    // Normalize token to avoid accidental malformed Authorization headers.
    token = token.trim().replace(/^"+|"+$/g, "");
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }

    if (token && token !== "null" && token !== "undefined" && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let browser set multipart boundary for FormData requests.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
