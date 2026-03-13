import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function Chat({ setShowInfo }) {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { role: "user", content: message };
        setChat((prev) => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/chat`, {
                message: message
            });

            const botMessage = { role: "assistant", content: res.data.reply };
            setChat((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: "assistant", content: "Error: Could not connect to the server." };
            setChat((prev) => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    const uploadFile = async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            await axios.post(`${API_URL}/upload`, formData);
            alert("Document indexed successfully!");
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">

            {/* Search/Header Bar */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-[#1a2b4b]">Knowledge Base</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">AI System Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
                {chat.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#1a2b4b]">Hello! I'm DocuMind AI</h3>
                            <p className="text-gray-500 mt-2">I've indexed your documents. Ask me anything about policies, procedures, or company data.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full pt-4">
                            <button onClick={() => setMessage("What are the main highlights?")} className="px-6 py-4 bg-[#f8fbff] hover:bg-blue-50 text-[#1a2b4b] text-sm font-semibold rounded-2xl border border-gray-100 transition-all text-left flex items-center justify-between group">
                                "What are the main highlights?"
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    chat.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                        >
                            <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[2rem] shadow-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200"
                                : "bg-[#f8fbff] text-[#1a2b4b] rounded-tl-none border border-gray-100"
                                }`}>
                                <div className={`text-sm ${msg.role === "user" ? "leading-relaxed" : "leading-relaxed prose prose-slate prose-sm max-w-none"}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-[#f8fbff] px-6 py-4 rounded-[2rem] rounded-tl-none border border-gray-100">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="px-8 pb-8 pt-4 bg-white">
                <div className="relative group flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => uploadFile(e.target.files[0])}
                        className="hidden"
                        accept=".pdf"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={`p-4 rounded-2xl border-2 transition-all ${uploading ? 'bg-gray-50 border-gray-100 text-gray-300' : 'bg-[#f8fbff] border-transparent hover:border-blue-100 text-gray-400 hover:text-blue-600'}`}
                        title="Upload PDF Document"
                    >
                        {uploading ? (
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        )}
                    </button>
                    <div className="relative flex-1">
                        <input
                            className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-5 px-6 pr-24 outline-none transition-all placeholder:text-gray-400 text-[#1a2b4b] shadow-inner"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder={uploading ? "Uploading document..." : "Ask anything about the documents..."}
                            disabled={uploading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !message.trim() || uploading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2"
                        >
                            <span>Ask</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-[0.2em] font-bold opacity-30">
                    Powered by RAG Architecture & OpenAI GPT-4o
                </p>
            </div>
        </main>
    );
}

export default Chat;
