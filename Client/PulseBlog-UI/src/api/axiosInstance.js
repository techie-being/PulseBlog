import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
    timeout: 30000,
});

// --- NEW: Axios Response Interceptor ---
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/users/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error("Session expired. Please log in again.");
                window.location.href = "/signin";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
export default axiosInstance;