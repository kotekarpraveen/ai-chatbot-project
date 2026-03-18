import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbots from "./pages/Chatbots";
import ChatbotDetails from "./pages/ChatbotDetails";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Analytics from "./pages/Analytics";
import Leads from "./pages/Leads";
import Billing from "./pages/Billing";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AppLayout = () => {
  const [showInfo, setShowInfo] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isLandingPage = location.pathname === "/";

  return (
    <div className={cn(
        "bg-[#f8fbff] flex flex-row font-sans",
        isLandingPage ? "min-h-screen" : "h-screen overflow-hidden"
    )}>
      {!isAuthPage && !isLandingPage && <Sidebar showInfo={showInfo} setShowInfo={setShowInfo} />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/demo" element={<Chat setShowInfo={setShowInfo} />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbots" element={<Chatbots />} />
          <Route path="/chatbots/:id" element={<ChatbotDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics/:chatbotId" element={<Analytics />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;