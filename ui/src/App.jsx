import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import Sidebar from "./components/Sidebar";

function App() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Router>
      <div className="h-screen bg-[#f8fbff] flex flex-row overflow-hidden font-sans">
        <Sidebar showInfo={showInfo} setShowInfo={setShowInfo} />

        <Routes>
          <Route path="/" element={<Chat setShowInfo={setShowInfo} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Analytics Placeholder */}
          <Route
            path="/analytics"
            element={
              <div className="flex-1 flex items-center justify-center bg-gray-50 md:rounded-l-[3rem] shadow-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14m-7 0h14" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#1a2b4b]">Analytics Dashboard</h2>
                  <p className="text-gray-500 text-sm">Coming soon in next release.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;