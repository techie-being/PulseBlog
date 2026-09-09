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
        }
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

    // No request information available
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never try to refresh the refresh-token request itself
    if (originalRequest.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    // Handle expired/invalid access token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Prevent infinite retry loop
      originalRequest._retry = true;

      try {
        // Wait for the single shared refresh operation
        await refreshAccessToken();

        // Refresh successful → retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        console.error("Session expired:", refreshError);

        return Promise.reject(refreshError);
      }
    }

    // All other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;