import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const chatbotId = queryParams.get("chatbotId");

    const [data, setData] = useState({
        totalConversations: 0,
        totalLeads: 0,
        topQuestions: [],
        recentLeads: []
    });
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (chatbotId) {
            fetchAnalytics();
        }
    }, [chatbotId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/analytics/${chatbotId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData({
                totalConversations: res.data.totalConversations || 0,
                totalLeads: res.data.totalLeads || 0,
                topQuestions: res.data.topQuestions || [],
                recentLeads: res.data.recentLeads || []
            });
        } catch (error) {
            console.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    if (!chatbotId) {
        return (
            <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl items-center justify-center">
                <h2 className="text-xl font-bold text-gray-500 mb-4">Please select a chatbot to view analytics</h2>
                <Link to="/chatbots" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700">Go to Chatbots</Link>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="px-8 py-6 border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Analytics Dashboard</h2>
                    <p className="text-xs text-gray-500">Monitor chatbot performance and collected leads</p>
                </div>
                <Link to="/chatbots" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">← Back</Link>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#f8fbff] p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Conversations</p>
                                    <h3 className="text-4xl font-extrabold text-[#1a2b4b] mt-2">{data.totalConversations}</h3>
                                </div>
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="bg-[#f8fbff] p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Leads</p>
                                    <h3 className="text-4xl font-extrabold text-[#1a2b4b] mt-2">{data.totalLeads}</h3>
                                </div>
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Top Questions Chart */}
                        <section className="bg-white border-2 border-gray-50 p-8 rounded-[2rem] space-y-6">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Top User Questions</h3>
                            {data.topQuestions.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-10">Not enough data to display top questions.</p>
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.topQuestions} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="user_message" width={250} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: '#f8fbff' }} />
                                            <Bar dataKey="frequency" fill="#2563eb" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        {/* Recent Leads Table */}
                        <section className="bg-white border-2 border-gray-50 p-8 rounded-[2rem] space-y-6">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Recent Leads</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 font-bold">Name</th>
                                            <th className="pb-4 font-bold">Email</th>
                                            <th className="pb-4 font-bold">Phone</th>
                                            <th className="pb-4 font-bold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.recentLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-400 italic text-sm">
                                                    No leads captured yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.recentLeads.map((lead, index) => (
                                                <tr key={index} className="hover:bg-[#f8fbff] transition-colors">
                                                    <td className="py-4 text-sm font-semibold text-[#1a2b4b]">{lead.name || '-'}</td>
                                                    <td className="py-4 text-sm text-gray-600">{lead.email || '-'}</td>
                                                    <td className="py-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                                                    <td className="py-4 text-xs text-gray-500">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
