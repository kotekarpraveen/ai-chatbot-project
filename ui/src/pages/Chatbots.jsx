import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import OnboardingOverlay from "../components/OnboardingOverlay";

export default function Chatbots() {
    const [chatbots, setChatbots] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchChatbots = async () => {
        try {
            const res = await api.get("/chatbots");
            setChatbots(res.data);
        } catch (error) {
            console.error("Failed to fetch chatbots");
        }
    };

    useEffect(() => {
        fetchChatbots();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/chatbots", { name, description });
            setName("");
            setDescription("");
            fetchChatbots();
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to create chatbot";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this chatbot? This will also remove all its knowledge.")) return;
        try {
            await api.delete(`/chatbots/${id}`);
            fetchChatbots();
        } catch (error) {
            alert("Failed to delete chatbot");
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            <OnboardingOverlay chatbotsCount={chatbots.length} />
            
            <div className="px-8 py-6 border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">My Chatbots</h2>
                    <p className="text-xs text-gray-500">Manage your organization's AI assistants</p>
                </div>
                {chatbots.length > 0 && (
                     <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {chatbots.length} Active Bot{chatbots.length !== 1 ? 's' : ''}
                     </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar shadow-inner bg-slate-50/30">
                {/* Create Chatbot */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1a2b4b]">Create New Chatbot</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Chatbot Name (e.g. Sales Assistant)"
                                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-blue-100 rounded-2xl px-6 py-4 outline-none transition-all shadow-inner text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-blue-100 rounded-2xl px-6 py-4 outline-none transition-all shadow-inner text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0 disabled:bg-gray-300 whitespace-nowrap"
                            >
                                {loading ? "Creating..." : "Create Chatbot"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* List Chatbots */}
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {chatbots.map((bot) => (
                            <div key={bot.id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between h-auto min-h-[18rem]">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                                <div className="relative">
                                    <h3 className="text-xl font-black text-[#1a2b4b] mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{bot.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4 line-clamp-2">{bot.description || 'No description provided'}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bot.messages_used || 0} msgs this month</span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added {new Date(bot.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative flex gap-3 pt-2">
                                    <Link 
                                        to={`/chatbots/${bot.id}`}
                                        className="flex-1 bg-slate-900 text-white text-center text-xs font-bold py-3.5 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                                    >
                                        Manage Bot
                                    </Link>
                                    <Link 
                                        to={`/analytics/${bot.id}`}
                                        className="p-3.5 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all font-bold"
                                        title="Analytics"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(bot.id)}
                                        className="p-3.5 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-bold"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s.5 0 1 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {chatbots.length === 0 && !loading && (
                            <div className="col-span-full py-20 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl animate-bounce">🤖</div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#1a2b4b]">Create your first chatbot</h3>
                                    <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">Start your AI journey by building an assistant tailored to your business needs.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

