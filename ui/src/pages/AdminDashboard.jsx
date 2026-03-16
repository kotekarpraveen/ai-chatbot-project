import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

const AdminDashboard = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const chatbotId = queryParams.get("chatbotId");

    const [sources, setSources] = useState([]);
    const [url, setUrl] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);
    const [trainLoading, setTrainLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [clearLoading, setClearLoading] = useState(false);
    const fileInputRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (chatbotId) fetchSources();
    }, [chatbotId]);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    const fetchSources = async () => {
        try {
            const res = await axios.get(`${API_URL}/sources?chatbotId=${chatbotId}`, getAuthHeaders());
            setSources(res.data);
        } catch (error) {
            console.error("Error fetching sources:", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chatbotId", chatbotId);

        try {
            await axios.post(`${API_URL}/upload`, formData, getAuthHeaders());
            alert("Document uploaded and indexed successfully!");
            fetchSources();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploadLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleTrainWebsite = async () => {
        if (!url.trim()) return;

        setTrainLoading(true);
        try {
            await axios.post(`${API_URL}/train-website`, { url, chatbotId }, getAuthHeaders());
            alert("Website trained successfully!");
            setUrl("");
            fetchSources();
        } catch (error) {
            console.error("Website training failed:", error);
            alert("Website training failed. Please check the URL.");
        } finally {
            setTrainLoading(false);
        }
    };

    const handleDeleteSource = async (id) => {
        if (!confirm("Are you sure you want to delete this source? This will remove its knowledge from the chatbot.")) return;

        setDeleteLoading(id);
        try {
            await axios.delete(`${API_URL}/sources/${id}`, getAuthHeaders());
            fetchSources();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleClearKnowledgeBase = async () => {
        if (!confirm("CRITICAL: Are you sure you want to clear the ENTIRE knowledge base? This action cannot be undone.")) return;

        setClearLoading(true);
        try {
            await axios.delete(`${API_URL}/sources`);
            setSources([]);
            alert("Knowledge base cleared successfully.");
        } catch (error) {
            console.error("Clear failed:", error);
            alert("Failed to clear knowledge base.");
        } finally {
            setClearLoading(false);
        }
    };

    if (!chatbotId) {
        return (
            <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl items-center justify-center">
                <h2 className="text-xl font-bold text-gray-500 mb-4">Please select a chatbot to manage</h2>
                <Link to="/chatbots" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700">Go to Chatbots</Link>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="px-8 py-6 border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Knowledge Base</h2>
                    <p className="text-xs text-gray-500">Manage knowledge sources for this chatbot</p>
                </div>
                <Link to="/chatbots" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">← Back</Link>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Step 1: Upload Document */}
                <section className="bg-[#f8fbff] p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a2b4b]">Upload Document (PDF)</h3>
                    </div>
                    <p className="text-sm text-gray-500">Upload PDF files to train the AI on specific documents.</p>

                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploadLoading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-300 flex items-center gap-2"
                        >
                            {uploadLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Select & Upload PDF
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Step 2: Train Website */}
                <section className="bg-[#f8fbff] p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a2b4b]">Train Website Crawler</h3>
                    </div>
                    <p className="text-sm text-gray-500">Enter a URL to scrape text and add it to the AI's knowledge base.</p>

                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="https://example.com/docs"
                            className="flex-1 bg-white border-2 border-transparent focus:border-blue-100 rounded-xl px-6 py-3 outline-none transition-all shadow-inner text-sm"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button
                            onClick={handleTrainWebsite}
                            disabled={trainLoading || !url.trim()}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
                        >
                            {trainLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : "Train AI"}
                        </button>
                    </div>
                </section>

                {/* Knowledge Sources List */}
                <section className="bg-white border-2 border-gray-50 p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[#1a2b4b]">Knowledge Sources</h3>
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-bold">{sources.length} Total</span>
                        </div>
                        <button
                            onClick={handleClearKnowledgeBase}
                            disabled={clearLoading || sources.length === 0}
                            className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                        >
                            {clearLoading ? "Clearing..." : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s.5 0 1 0" />
                                    </svg>
                                    Clear All Knowledge
                                </>
                            )}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                    <th className="pb-4 font-bold">Type</th>
                                    <th className="pb-4 font-bold">Source Name / URL</th>
                                    <th className="pb-4 font-bold">Added On</th>
                                    <th className="pb-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sources.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-gray-400 italic text-sm">
                                            No knowledge sources indexed yet.
                                        </td>
                                    </tr>
                                ) : (
                                    sources.map((source) => (
                                        <tr key={source.id} className="group hover:bg-[#f8fbff] transition-colors">
                                            <td className="py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${source.type === "PDF" ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"
                                                    }`}>
                                                    {source.type}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <p className="text-sm font-semibold text-[#1a2b4b] truncate max-w-xs">{source.name}</p>
                                            </td>
                                            <td className="py-4 text-xs text-gray-500">
                                                {new Date(source.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteSource(source.id)}
                                                    disabled={deleteLoading === source.id}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    {deleteLoading === source.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s.5 0 1 0" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminDashboard;
