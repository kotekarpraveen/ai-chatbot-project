import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useLocation, Link, useSearchParams } from "react-router-dom";

function Chat({ setShowInfo }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const chatbotId = searchParams.get("chatbotId");
    const isEmbedded = searchParams.get("embedded") === "true";

    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatbots, setChatbots] = useState([]);
    const [currentBot, setCurrentBot] = useState(null);
    const [leadCaptured, setLeadCaptured] = useState(false);

    // Persistent Session ID
    const [sessionId, setSessionId] = useState(() => {
        const urlSession = searchParams.get("sessionId");
        if (urlSession) return urlSession;

        const localSession = localStorage.getItem(`chat_session_${chatbotId}`);
        if (localSession) return localSession;

        const newSession = "sess_" + Math.random().toString(36).substring(2, 15);
        if (chatbotId) localStorage.setItem(`chat_session_${chatbotId}`, newSession);
        return newSession;
    });

    // For lead capture
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [capturingLead, setCapturingLead] = useState(false);

    const scrollContainerRef = useRef(null);

    // Fetch chatbot details or list
    useEffect(() => {
        if (chatbotId) {
            setChat([]);
            setLeadCaptured(false);
            fetchCurrentBot();
        } else if (!isEmbedded) {
            fetchChatbots();
        }
    }, [chatbotId, isEmbedded]);

    const fetchCurrentBot = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await axios.get(`${API_URL}/chatbots/${chatbotId}`, config);
            setCurrentBot(res.data);
        } catch (error) {
            console.error("Failed to fetch current chatbot");
        }
    };

    const fetchChatbots = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = localStorage.getItem("token");
            if (!token) return; // Don't fetch if not logged in

            const res = await axios.get(`${API_URL}/chatbots`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatbots(res.data);
        } catch (error) {
            console.error("Failed to fetch chatbots for dropdown");
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [chat]);

    const captureLead = async (e) => {
        e.preventDefault();
        setCapturingLead(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            await axios.post(`${API_URL}/leads`, { chatbotId, name, email });
            setLeadCaptured(true);
            setChat((prev) => [...prev, { role: "assistant", content: "Thank you! Our human team will get back to you shortly." }]);
        } catch (error) {
            console.error("Lead capture failed");
            alert("Failed to submit details.");
        } finally {
            setCapturingLead(false);
        }
    };

    const greeting = {
        role: "assistant",
        content: "Hi 👋 How can I help you today? I can answer questions about our services, pricing, or help you get started."
    };

    const closeChat = () => {
        window.parent.postMessage("closeChatbot", "*");
    };

    const sendMessage = async () => {
        if (!message.trim() || !chatbotId) return;

        const userMessage = { role: "user", content: message };
        // If chat is empty except for possible greeting, initialize it
        setChat((prev) => prev.length === 0 ? [greeting, userMessage] : [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/chat`, {
                message: message,
                chatbotId: chatbotId,
                sessionId: sessionId
            });

            const botMessage = { role: "assistant", content: res.data.reply };
            setChat((prev) => [...prev, botMessage]);

            // Feature 3: Smart Lead Form Triggering
            if (res.data.triggerLeadForm && !leadCaptured) {
                const promptLead = {
                    role: "assistant",
                    content: "Would you like our team to follow up with you? Please leave your details below.",
                    isLeadForm: true
                };
                setChat((prev) => [...prev, promptLead]);
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Our brain is a bit tired. Please try again in a moment.";
            const errorMessage = { role: "assistant", content: `⚠️ ${errorMsg}` };
            setChat((prev) => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    if (!chatbotId && !isEmbedded) {
        return (
            <main className="flex-1 flex flex-col h-full bg-[#f8fbff] md:rounded-l-[3rem] shadow-2xl items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-white text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-[#1a2b4b] tracking-tight">AI Assistant Portal</h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">Select a specialized chatbot to begin your interaction experience.</p>
                </div>

                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {chatbots.length > 0 ? (
                        chatbots.map(bot => (
                            <Link 
                                key={bot.id} 
                                to={`/demo?chatbotId=${bot.id}`} 
                                className="group bg-white border border-slate-100 p-6 rounded-[2rem] text-left hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-[#1a2b4b] group-hover:text-blue-600 transition-colors">{bot.name}</h3>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{bot.description || 'No description'}</p>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <Link to="/chatbots" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95">
                                <span>Create Your First Agent</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    const resetChat = () => {
        if (confirm("Reset this conversation?")) {
            setChat([]);
            const newSess = "sess_" + Math.random().toString(36).substring(2, 15);
            setSessionId(newSess);
            localStorage.setItem(`chat_session_${chatbotId}`, newSess);
        }
    };

    return (
        <main className={`flex-1 flex flex-col h-full bg-[#fbfdff] relative overflow-hidden transition-all duration-500 ${!isEmbedded ? 'md:rounded-l-[3rem] shadow-2xl border-l border-white' : ''}`}>
            {/* Elegant Header */}
            <div className={`flex items-center justify-between border-b border-slate-100/50 backdrop-blur-xl bg-white/70 sticky top-0 z-20 flex-shrink-0 transition-all ${isEmbedded ? 'px-6 py-4' : 'px-8 py-6'}`}>
                <div className="flex items-center gap-4">
                    {!isEmbedded && (
                        <button
                            onClick={() => setShowInfo(true)}
                            className="md:hidden p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${isEmbedded ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm'} bg-gradient-to-br from-blue-500 to-indigo-600`}>
                                {currentBot ? currentBot.name.substring(0, 2).toUpperCase() : 'AI'}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h2 className={`font-black text-[#1a2b4b] tracking-tight leading-none mb-1.5 ${isEmbedded ? 'text-base' : 'text-xl'}`}>
                                {currentBot ? currentBot.name : 'AI Support Assistant'}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest opacity-80">Connected</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isEmbedded && (
                        <button 
                            onClick={resetChat}
                            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:text-blue-600"
                            title="Reset Conversation"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                    
                    {isEmbedded && (
                        <button 
                            onClick={closeChat}
                            className="p-2.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90"
                            title="Close chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Message Area */}
            <div 
                ref={scrollContainerRef}
                className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-slate-50/30 ${isEmbedded ? 'p-4 space-y-6' : 'p-6 md:p-10 space-y-8'}`}
            >
                {chat.length === 0 ? (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="max-w-[90%] md:max-w-[80%] flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">AI</div>
                            <div className="px-6 py-4 rounded-[1.75rem] rounded-tl-none bg-white text-[#1a2b4b] border border-slate-100 shadow-sm shadow-slate-200/50">
                                <div className="text-sm leading-relaxed prose prose-slate prose-sm max-w-none font-medium">
                                    <ReactMarkdown>{greeting.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    chat.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`flex gap-3 max-w-[92%] md:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                {msg.role !== "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">AI</div>
                                )}
                                <div className={`px-6 py-4 shadow-sm relative ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-[1.75rem] rounded-tr-none shadow-blue-200 font-medium"
                                    : "bg-white text-[#1a2b4b] rounded-[1.75rem] rounded-tl-none border border-slate-100 shadow-slate-200/50"
                                    }`}>

                                    {msg.isLeadForm ? (
                                        <div className="space-y-5">
                                            <div className="text-sm leading-relaxed font-bold tracking-tight"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                                            {!leadCaptured && (
                                                <form onSubmit={captureLead} className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                                        <input required type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full text-sm p-3.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-400 transition-all shadow-inner" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                                        <input required type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm p-3.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-400 transition-all shadow-inner" />
                                                    </div>
                                                    <button disabled={capturingLead} type="submit" className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-[0.98]">
                                                        {capturingLead ? 'Processing...' : 'Submit Contact Details'}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`text-sm leading-relaxed ${msg.role === "user" ? "" : "prose prose-slate prose-sm max-w-none font-medium text-slate-700"}`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                    
                                    <div className={`absolute top-full mt-1.5 text-[9px] font-bold uppercase tracking-widest opacity-30 ${msg.role === "user" ? "right-2" : "left-2"}`}>
                                        {msg.role === "user" ? "Sent" : "Assistant"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">...</div>
                            <div className="bg-white px-6 py-4 rounded-[1.75rem] rounded-tl-none border border-slate-100 shadow-sm shadow-slate-200/50">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Premium Input Area */}
            <div className={`bg-white/80 backdrop-blur-xl flex-shrink-0 border-t border-slate-100 p-4 pb-8 transition-all ${isEmbedded ? 'px-4' : 'px-10'}`}>
                <div className={`relative flex items-center max-w-4xl mx-auto transition-all ${isEmbedded ? 'bg-slate-50 border border-slate-100 rounded-[2rem] px-2 py-1.5 shadow-inner' : 'gap-4'}`}>
                    <input
                        className={`flex-1 bg-transparent py-4 px-6 outline-none transition-all placeholder:text-slate-300 text-slate-900 ${!isEmbedded ? 'bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[2rem] shadow-inner text-sm' : 'text-sm'}`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your question relative to our services..."
                    />
                    
                    <button
                        onClick={sendMessage}
                        disabled={loading || !message.trim()}
                        className={`bg-blue-600 hover:bg-black disabled:opacity-20 disabled:scale-95 disabled:hover:bg-blue-600 text-white rounded-[1.5rem] font-bold transition-all shadow-xl shadow-blue-200 active:scale-90 flex items-center justify-center ${isEmbedded ? 'w-11 h-11 p-0' : 'px-8 py-4 gap-2 text-sm'}`}
                    >
                        {isEmbedded ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        ) : (
                            <>
                                <span>Send Message</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </>
                        )}
                    </button>
                </div>
                {!isEmbedded ? (
                    <div className="flex justify-center items-center gap-6 mt-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">AI Support Portal</p>
                    </div>
                ) : (
                    <div className="flex justify-center mt-3">
                         <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.2em]">Powered by your AI Chatbot</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Chat;
