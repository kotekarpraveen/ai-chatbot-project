import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    // The chat widget is public if it has a chatbotId or is embedded
    const queryParams = new URLSearchParams(location.search);
    const chatbotId = queryParams.get("chatbotId");
    const isEmbedded = queryParams.get("embedded") === "true";

    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Session validation failed:", error);
                localStorage.removeItem("token");
                setIsAuthenticated(false);
            }
        };

        validateSession();
    }, [location.pathname]);

    // Show a loading state while validating the token initially
    if (isAuthenticated === null) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8fbff] h-screen">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Allow public access to the chat interface if it has a chatbotId (for sharing/embedding)
    if (location.pathname === "/" && (chatbotId || isEmbedded)) {
        return <Outlet />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
