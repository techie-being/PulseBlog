import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  timeout: 30000,
});

// Shared refresh operation
let refreshPromise = null;

const refreshAccessToken = () => {
  // If a refresh request is already running,
  // return the same Promise instead of creating another one.
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/users/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .finally(() => {
        // Refresh operation is finished.
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Response interceptor
axiosInstance.interceptors.response.use(
  // Successful response
  (response) => {
    return response;
  },

  // Failed response
  async (error) => {
    
    console.log("🔥 AXIOS ERROR:", error);
    console.log("🔥 MESSAGE:", error.message);
    console.log("🔥 CODE:", error.code);
    console.log("🔥 RESPONSE:", error.response);
    console.log("🔥 REQUEST:", error.request);
    console.log("🔥 URL:", error.config?.url);

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔥 401 detected → trying refresh");

      originalRequest._retry = true;

      try {
        await refreshAccessToken();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Session expired:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },

  // All other errors
);

export default axiosInstance;
