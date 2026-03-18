import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.response?.data?.message || "Something went wrong. Please try again.";
        
        if (error.response?.status === 401) {
            // Unauthorized - clear token and potentially redirect
            localStorage.removeItem("token");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login?expired=true";
            }
        }
        
        if (error.response?.status === 429) {
            console.error("Rate limit exceeded");
        }

        // We can still reject to let the component handle specific logic
        return Promise.reject(error);
    }
);

export default api;
