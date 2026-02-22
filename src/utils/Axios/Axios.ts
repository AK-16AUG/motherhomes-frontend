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
    let token = localStorage.getItem("token");

    // Sanitize token: remove any surrounding quotes that might have been added
    if (token && (token.startsWith('"') && token.endsWith('"'))) {
      token = token.slice(1, -1);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;