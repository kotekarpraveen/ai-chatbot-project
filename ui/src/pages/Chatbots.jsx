import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Chatbots() {
    const [chatbots, setChatbots] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchChatbots = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/chatbots`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/chatbots`, { name, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/chatbots/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchChatbots();
        } catch (error) {
            alert("Failed to delete chatbot");
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="px-8 py-6 border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10">
                <h2 className="text-xl font-bold text-[#1a2b4b]">My Chatbots</h2>
                <p className="text-xs text-gray-500">Manage your organization's AI assistants</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Create Chatbot */}
                <section className="bg-[#f8fbff] p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-[#1a2b4b]">Create New Chatbot</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Chatbot Name (e.g. Sales Assistant)"
                                className="flex-1 bg-white border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                className="flex-1 bg-white border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-300 whitespace-nowrap"
                            >
                                {loading ? "Creating..." : "Create Chatbot"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* List Chatbots */}
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {chatbots.length === 0 ? (
                            <p className="text-gray-500 text-sm">No chatbots created yet.</p>
                        ) : (
                            chatbots.map(bot => (
                                <div key={bot.id} className="bg-white border-2 border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                                                {bot.name.charAt(0)}
                                            </div>
                                            <button onClick={() => handleDelete(bot.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s.5 0 1 0" />
                                                </svg>
                                            </button>
                                        </div>
                                        <h4 className="text-lg font-bold text-[#1a2b4b]">{bot.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bot.description || 'No description'}</p>
                                    </div>
                                    <div className="mt-6 flex flex-col gap-2">
                                        <div className="text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded-lg truncate">
                                            ID: {bot.id}
                                        </div>
                                        <Link
                                            to={`/admin?chatbotId=${bot.id}`}
                                            className="text-center w-full bg-[#f8fbff] text-blue-600 font-bold py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                                        >
                                            Manage Knowledge
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
