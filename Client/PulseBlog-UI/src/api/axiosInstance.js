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
    

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never try to refresh the refresh-token request itself
    if (originalRequest.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    /*
     * These endpoints can legitimately return 401.
     * Their 401 response should go directly back to the component
     * instead of triggering the refresh-token flow.
     */
    const isAuthRequest =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/forgot-password") ||
      originalRequest.url?.includes("/reset-password") ||
      originalRequest.url?.includes("/google");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
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
);

export default axiosInstance;