import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useLocation, Link } from "react-router-dom";

function Chat({ setShowInfo }) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const chatbotId = queryParams.get("chatbotId");
    const isEmbedded = queryParams.get("embedded") === "true";

    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatbots, setChatbots] = useState([]);
    const [leadCaptured, setLeadCaptured] = useState(false);

    // For lead capture
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [capturingLead, setCapturingLead] = useState(false);

    const chatEndRef = useRef(null);

    // Fetch chatbots if not embedded and no chatbotId is provided
    useEffect(() => {
        if (!chatbotId && !isEmbedded) {
            fetchChatbots();
        }
    }, [chatbotId, isEmbedded]);

    const fetchChatbots = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = localStorage.getItem("token");
            if (token) {
                const res = await axios.get(`${API_URL}/chatbots`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChatbots(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch chatbots for dropdown");
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    const sendMessage = async () => {
        if (!message.trim() || !chatbotId) return;

        const userMessage = { role: "user", content: message };
        setChat((prev) => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await axios.post(`${API_URL}/chat`, {
                message: message,
                chatbotId: chatbotId
            });

            const botMessage = { role: "assistant", content: res.data.reply };
            setChat((prev) => [...prev, botMessage]);

            // Randomly trigger lead capture after 3 messages if not captured yet
            if (chat.length >= 2 && !leadCaptured) {
                const promptLead = {
                    role: "assistant",
                    content: "Would you like our human team to follow up with you?",
                    isLeadForm: true
                };
                setChat((prev) => [...prev, promptLead]);
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Error: Could not connect to the server.";
            const errorMessage = { role: "assistant", content: errorMsg };
            setChat((prev) => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    if (!chatbotId && !isEmbedded) {
        return (
            <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#1a2b4b]">Select a Chatbot to Demo</h2>
                <p className="text-gray-500 max-w-md">You need to specify which chatbot you want to interact with. Select one of your created bots below:</p>

                {chatbots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                        {chatbots.map(bot => (
                            <Link key={bot.id} to={`/?chatbotId=${bot.id}`} className="bg-[#f8fbff] border-2 border-gray-100 p-4 rounded-xl text-left hover:border-blue-400 hover:bg-white transition-all shadow-sm">
                                <h3 className="font-bold text-[#1a2b4b]">{bot.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{bot.description || 'No description'}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Link to="/chatbots" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        Create a Chatbot First
                    </Link>
                )}
            </main>
        );
    }

    return (
        <main className={`flex-1 flex flex-col h-full bg-white relative overflow-hidden transition-all duration-500 ${!isEmbedded ? 'md:rounded-l-[3rem] shadow-2xl' : ''}`}>
            {/* Header Bar */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {!isEmbedded && (
                        <button
                            onClick={() => setShowInfo(true)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-[#1a2b4b]">Chat Support</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar">
                {chat.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-80">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#1a2b4b]">Hello!</h3>
                            <p className="text-sm text-gray-500 mt-2">I'm a virtual assistant. How can I help you today?</p>
                        </div>
                    </div>
                ) : (
                    chat.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[2rem] shadow-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200"
                                : "bg-[#f8fbff] text-[#1a2b4b] rounded-tl-none border border-gray-100"
                                }`}>

                                {msg.isLeadForm ? (
                                    <div className="space-y-4">
                                        <div className="text-sm leading-relaxed"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                                        {!leadCaptured && (
                                            <form onSubmit={captureLead} className="space-y-3 bg-white p-4 rounded-xl border border-blue-100 mt-2">
                                                <input required type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full text-sm p-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:border-blue-400" />
                                                <input required type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm p-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:border-blue-400" />
                                                <button disabled={capturingLead} type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                                                    {capturingLead ? 'Submitting...' : 'Have someone contact me'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`text-sm ${msg.role === "user" ? "leading-relaxed" : "leading-relaxed prose prose-slate prose-sm max-w-none"}`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
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
            <div className="px-5 pb-5 pt-3 bg-white flex-shrink-0 border-t border-gray-50">
                <div className="relative flex items-center">
                    <input
                        className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] py-4 px-6 pr-20 outline-none transition-all placeholder:text-gray-400 text-[#1a2b4b]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !message.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none text-white w-12 h-12 rounded-[1rem] transition-all shadow-md shadow-blue-200 active:scale-95 flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                {!isEmbedded && (
                    <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-[0.2em] font-bold opacity-30">
                        SaaS Platform MVP Backend
                    </p>
                )}
            </div>
        </main>
    );
}

export default Chat;
