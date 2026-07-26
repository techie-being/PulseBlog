import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true,
    timeout: 30000,
});

// --- NEW: Axios Response Interceptor ---
axiosInstance.interceptors.response.use(
    (response) => {
        // If the request succeeds, just return the response
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) AND we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Mark this request so we don't end up in an infinite retry loop
            originalRequest._retry = true;

            try {
                // Call the backend to refresh the tokens
                // Since withCredentials is true, the expired cookies are sent automatically
                await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/users/refresh-token, {}, {
                    withCredentials: true
                }`);

                // If successful, the backend just set new fresh cookies!
                // Now, automatically retry the original request (like saving the blog post)
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                // If the refresh token is ALSO expired, the user is truly logged out.
                console.error("Session expired. Please log in again.");
                // Redirect them to the sign-in page to start over
                window.location.href = "/signin";
                return Promise.reject(refreshError);
            }
        }

        // For all other errors (like 404, 500, etc.), just return the error normally
        return Promise.reject(error);
    }
);

export default axiosInstance;