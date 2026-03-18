import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from "recharts";

export default function Analytics() {
    const { chatbotId } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatbotName, setChatbotName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, botRes, usageRes] = await Promise.all([
                    api.get(`/analytics/${chatbotId}`),
                    api.get("/chatbots"),
                    api.get("/billing/usage")
                ]);
                
                setStats({
                    ...statsRes.data,
                    limit: usageRes.data.limit || 1000
                });
                const currentBot = botRes.data.find(b => b.id === chatbotId);
                if (currentBot) setChatbotName(currentBot.name);

            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [chatbotId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[3rem]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    const usagePercent = Math.min(Math.round((stats.messagesUsed / stats.limit) * 100), 100);

    return (
        <main className="flex-1 flex flex-col h-full bg-slate-50 md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/chatbots" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-[#1a2b4b]">{chatbotName} Analytics</h2>
                        <p className="text-xs text-gray-500 tracking-wide uppercase font-medium">Performance Metrics & Insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500">Real-time Data</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">💬</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">Sessions</span>
                        </div>
                        <h4 className="text-3xl font-black text-[#1a2b4b]">{stats.totalChats}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Unique Chats</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">⚡</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500 bg-purple-50 px-3 py-1 rounded-full">Volume</span>
                        </div>
                        <h4 className="text-3xl font-black text-[#1a2b4b]">{stats.totalMessages}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Total Messages</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">👥</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 bg-green-50 px-3 py-1 rounded-full">Success</span>
                        </div>
                        <h4 className="text-3xl font-black text-[#1a2b4b]">{stats.totalLeads}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Total Leads</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="mb-4">
                           <span className="text-2xl">📊</span>
                        </div>
                        <div className="flex justify-between items-end mb-1">
                            <h4 className="text-3xl font-black text-[#1a2b4b]">{usagePercent}%</h4>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{stats.messagesUsed} / {stats.limit}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                            <div 
                                className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${usagePercent}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Plan Usage</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Daily Conversations</h3>
                            <p className="text-xs text-gray-400">Activity trend over the last 30 days</p>
                        </div>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyTrends}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        labelFormatter={(str) => new Date(str).toLocaleDateString()}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Top Questions</h3>
                            <p className="text-xs text-gray-400">Most frequent queries from your users</p>
                        </div>
                        <div className="space-y-4">
                            {stats.topQuestions.length > 0 ? (
                                stats.topQuestions.map((q, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4 flex-1 mr-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg text-xs font-black">{i+1}</span>
                                            <p className="text-sm text-[#1a2b4b] font-medium truncate max-w-[200px] md:max-w-none">{q.user_message}</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{q.frequency} hits</span>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center py-20 text-gray-400 text-sm italic">
                                    No questions tracked yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Recent Leads</h3>
                            <p className="text-xs text-gray-400">Captured through conversation intent</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Name</th>
                                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentLeads.map((lead, i) => (
                                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                                    {lead.name?.charAt(0) || "U"}
                                                </div>
                                                <span className="text-sm font-bold text-[#1a2b4b]">{lead.name || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-500 font-medium">{lead.email}</td>
                                        <td className="py-4 text-sm text-gray-400">{lead.phone || "-"}</td>
                                        <td className="py-4 text-xs text-gray-400 font-medium">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentLeads.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-400 text-sm italic">No leads captured yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
