import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  timeout: 30000,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // No request config — just reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never try to refresh the refresh-token request itself
    if (originalRequest.url?.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    // Only refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true,
          },
        );
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
