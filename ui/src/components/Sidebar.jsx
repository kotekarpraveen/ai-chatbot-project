import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const Sidebar = ({ showInfo, setShowInfo }) => {
    const location = useLocation();
    const [usage, setUsage] = useState(0);
    const [plan, setPlan] = useState("Free");

    useEffect(() => {
        const fetchUsage = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const [usageRes, subRes] = await Promise.all([
                    axios.get(`${API_URL}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/billing/subscription`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setUsage(usageRes.data.messagesUsed || 0);
                setPlan(subRes.data.plan || "Free");
            } catch (error) {
                console.error("Sidebar usage fetch failed");
            }
        };
        fetchUsage();
    }, [location.pathname]);

    const limit = plan === "Pro" ? 10000 : (plan === "Enterprise" ? Infinity : 1000);
    const usagePercent = limit === Infinity ? 0 : Math.min(100, (usage / limit) * 100);

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: "Chatbots",
            path: "/chatbots",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: "Knowledge Base",
            path: "/admin",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826 3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: "Leads",
            path: "/leads",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: "Billing",
            path: "/billing",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: "Settings",
            path: "/settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826 3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: "Demo Player",
            path: "/demo",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <>
            {showInfo && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setShowInfo(false)}></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 shadow-xl md:shadow-sm md:static md:w-80 md:translate-x-0 ${showInfo ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">D</div>
                        <h1 className="text-2xl font-extrabold text-[#1a2b4b] tracking-tight">DocuMind AI</h1>
                    </Link>
                    <button onClick={() => setShowInfo(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-4">Main Menu</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-semibold ${location.pathname === item.path
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                            onClick={() => setShowInfo(false)}
                        >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Usage Card */}
                <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Usage Tracker</span>
                        <span className={usagePercent > 80 ? 'text-red-500' : 'text-blue-600'}>{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${usagePercent}%` }}></div>
                    </div>
                    <Link to="/billing" className="block text-[10px] text-blue-600 font-bold hover:underline">Upgrade Plan</Link>
                </section>

                <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-50 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">All Systems Normal</p>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
                        className="w-full text-left text-xs text-red-500 font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors mt-2"
                    >
                        Sign Out
                    </button>
                </section>

                <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-bold opacity-30">v2.5.0 Enterprise</p>
            </aside>
        </>
    );
};

export default Sidebar;
