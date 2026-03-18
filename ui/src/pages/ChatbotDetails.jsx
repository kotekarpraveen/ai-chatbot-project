import { useState, useEffect } from "react";
import api from "../api";
import { useParams, Link } from "react-router-dom";

export default function ChatbotDetails() {
    const { id } = useParams();
    const [bot, setBot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/chatbots/${id}`);
                setBot(res.data);
            } catch (error) {
                console.error("Failed to fetch chatbot details for ID:", id, error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const widgetCode = `<script src="https://chatbot.apzelio.com/widget.js" data-chatbot="${id}"></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[3rem]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!bot) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 bg-slate-50 md:rounded-l-[3rem]">
                <div className="text-4xl">🔎</div>
                <h3 className="text-xl font-bold text-[#1a2b4b]">Chatbot Not Found</h3>
                <p className="text-gray-400">This bot might have been deleted or is inaccessible.</p>
                <Link to="/chatbots" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold">Back to List</Link>
            </div>
        );
    }

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
                        <h2 className="text-xl font-bold text-[#1a2b4b]">{bot.name}</h2>
                        <p className="text-xs text-gray-500 tracking-wide uppercase font-medium">Assistant Settings & Installation</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/admin?chatbotId=${bot.id}`} className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-all">
                        Edit Knowledge
                    </Link>
                    <Link to={`/analytics/${bot.id}`} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        View Analytics
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Messages Used", value: bot.messagesUsed, icon: "⚡" },
                        { label: "Knowledge Base", value: `${bot.sourcesCount} Sources`, icon: "📚" },
                        { label: "Total Leads", value: bot.leadsCount, icon: "👥" },
                        { label: "Status", value: "Active", icon: "🟢" }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="text-xl mb-2">{stat.icon}</div>
                            <h4 className="text-xl font-black text-[#1a2b4b]">{stat.value}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Widget Installation */}
                <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#1a2b4b]">Install your chatbot</h3>
                        <p className="text-sm text-gray-500 mt-2">Copy and paste this code into the header of your website to start using this AI assistant.</p>
                    </div>

                    <div className="relative group">
                        <pre className="bg-slate-900 text-blue-100 p-8 rounded-3xl overflow-x-auto text-xs font-mono border-4 border-slate-800 shadow-2xl">
                            {widgetCode}
                        </pre>
                        <button 
                            onClick={handleCopy}
                            className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-50">
                            <h4 className="text-sm font-bold text-blue-600 mb-2">Development Demo</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">Test your chatbot in a sandbox environment before going live on your site.</p>
                            <Link to={`/?chatbotId=${bot.id}`} className="text-xs font-bold text-blue-600 hover:underline">Launch Demo Player →</Link>
                        </div>
                        <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-50">
                            <h4 className="text-sm font-bold text-purple-600 mb-2">Usage Summary</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This bot has handled {bot.messagesUsed} interactions this month. 
                                Make sure your knowledge base is up to date for the best customer experience.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1a2b4b] mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/admin" className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-center hover:bg-slate-100 transition-all">
                             <p className="text-sm font-bold text-gray-700">Settings</p>
                        </Link>
                        <Link to="/leads" className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-center hover:bg-slate-100 transition-all">
                             <p className="text-sm font-bold text-gray-700">Export Leads</p>
                        </Link>
                        <Link to="/billing" className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-center hover:bg-slate-100 transition-all">
                             <p className="text-sm font-bold text-gray-700">Billing</p>
                        </Link>
                        <button onClick={() => alert("Integration settings coming soon")} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-center hover:bg-slate-100 transition-all">
                             <p className="text-sm font-bold text-gray-700">Integrations</p>
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
