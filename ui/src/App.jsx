import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbots from "./pages/Chatbots";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Analytics from "./pages/Analytics";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

const AppLayout = () => {
  const [showInfo, setShowInfo] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="h-screen bg-[#f8fbff] flex flex-row overflow-hidden font-sans">
      {!isAuthPage && <Sidebar showInfo={showInfo} setShowInfo={setShowInfo} />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/chatbots" element={<Chatbots />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Chat setShowInfo={setShowInfo} />} />
          <Route path="/analytics" element={<Analytics />} />
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