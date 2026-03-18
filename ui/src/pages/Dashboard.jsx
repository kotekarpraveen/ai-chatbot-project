import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalChatbots: 0,
        totalMessages: 0,
        totalLeads: 0,
        recentLeads: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [chatbotsRes, usageRes, leadsRes] = await Promise.all([
                    api.get("/chatbots"),
                    api.get("/billing/usage"),
                    api.get("/leads")
                ]);
                
                setStats({
                    totalChatbots: chatbotsRes.data.length,
                    totalMessages: usageRes.data.messagesUsed || 0,
                    totalLeads: leadsRes.data.length,
                    recentLeads: leadsRes.data.slice(0, 5)
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[3rem]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (stats.totalChatbots === 0 && !loading) {
        return (
            <main className="flex-1 flex flex-col h-full bg-slate-50 md:rounded-l-[3rem] shadow-2xl items-center justify-center p-8 text-center space-y-8">
                <div className="w-32 h-32 bg-blue-100/50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner animate-bounce">🤖</div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-[#1a2b4b]">Ready to build your AI workforce?</h2>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto">Create your first chatbot assistant to start automating customer interactions and capturing leads.</p>
                </div>
                <Link to="/chatbots" className="bg-blue-600 text-white font-black py-4 px-12 rounded-[1.5rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1">
                    Get Started Now
                </Link>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-slate-50 md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Overview</h2>
                    <p className="text-xs text-gray-500 tracking-wide uppercase font-medium">System Performance Summary</p>
                </div>
                <Link to="/chatbots" className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    + New Chatbot
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Chatbots", value: stats.totalChatbots, icon: "🤖", color: "blue", link: "/chatbots" },
                        { label: "Total Messages", value: stats.totalMessages, icon: "⚡", color: "purple", link: "/billing" },
                        { label: "Captured Leads", value: stats.totalLeads, icon: "👥", color: "green", link: "/leads" }
                    ].map((card) => (
                        <Link key={card.label} to={card.link} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl">{card.icon}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                            <h4 className="text-3xl font-black text-[#1a2b4b]">{card.value}</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{card.label}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Welcome Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full -mr-20 -mt-20"></div>
                        <div className="relative">
                            <h3 className="text-2xl font-black text-[#1a2b4b] mb-4">Good Day! 👋</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                Your AI assistants are currently handling inquiries and capturing leads. 
                                Check your analytics to see how they're performing or train them with 
                                new data to improve accuracy.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-4 relative">
                            <Link to="/admin" className="text-sm font-bold bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-colors">
                                Manage Knowledge
                            </Link>
                            <Link to="/" className="text-sm font-bold bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                                Demo Player
                            </Link>
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Recent Leads</h3>
                            <Link to="/leads" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {stats.recentLeads.length > 0 ? (
                                stats.recentLeads.map((lead, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                                                {lead.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#1a2b4b]">{lead.name || "Unknown"}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{lead.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(lead.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400 text-sm italic">
                                    No leads captured yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
