import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Add the login token to every API request.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
 * Handle API errors in one place.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Keep cancelled requests untouched.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    const normalizedError = new Error(message);

    return Promise.reject(normalizedError);
  }
);

export default api;