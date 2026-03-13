import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
function App() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." }
  ]);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setChat([...chat, { sender: "user", text: message }]);
    setLoading(true);

    try {

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(`${API_URL}/chat`, {
        message: message
      });

      const botReply = res.data.reply;

      setMessages([...updatedMessages, { role: "assistant", content: botReply }]);

      setChat(prev => [
        ...prev,
        { sender: "bot", text: botReply }
      ]);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    setMessage("");
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
    <div className="h-screen bg-[#f8fbff] flex flex-row overflow-hidden font-sans">

      {/* Sidebar Overlay for Mobile */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowInfo(false)}
        ></div>
      )}

      {/* Sidebar: Product Information */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 shadow-xl md:shadow-sm md:static md:w-1/4 md:translate-x-0
        ${showInfo ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              D
            </div>
            <h1 className="text-2xl font-extrabold text-[#1a2b4b] tracking-tight">DocuMind AI</h1>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <section className="space-y-4">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">About the Product</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            DocuMind AI is a state-of-the-art <strong>Retrieval-Augmented Generation (RAG)</strong> platform designed to turn your static documents into interactive knowledge.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">How it Works</h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-blue-100 italic">1</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1a2b4b]">PDF Ingestion</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">Smart parsing of complex PDF structures into clean text.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-blue-100 italic">2</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1a2b4b]">Vector Mapping</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">Conversion of text into high-dimensional numerical values (embeddings) for semantic understanding.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-blue-100 italic">3</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1a2b4b]">Semantic Search</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">Instantly finding the exact context within seconds, regardless of document size.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-blue-100 italic">4</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1a2b4b]">AI Generation</h3>
                <p className="text-xs text-gray-500 mt-1 leading-normal">Providing human-like answers synthesized from retrieved factual data.</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="mt-auto bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
          <h3 className="font-bold flex items-center gap-2 mb-2">
            🚀 Ready for Demo
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed">
            Ask questions like "What is the policy?" or "Summarize the findings" to see the RAG engine in action.
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header (Mobile-Friendly) */}
        <header className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-[#1a2b4b]">Consultant Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Knowledge Base Active</span>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(true)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs border border-blue-100"
          >
            <span>INFO</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scrollbar-hide">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-50 space-y-4">
              <div className="p-4 bg-gray-50 rounded-full">💬</div>
              <p className="text-gray-500 text-sm italic">"Start the conversation by asking about your indexed company documents."</p>
            </div>
          )}

          {chat.map((c, i) => (
            <div
              key={i}
              className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm
                  ${c.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100"
                    : "bg-[#f1f5f9] text-[#1e293b] rounded-tl-none border border-gray-100"}`}
              >
                <div className="markdown-content">
                  <ReactMarkdown>{c.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f1f5f9] px-5 py-3.5 rounded-2xl rounded-tl-none border border-gray-100 text-sm flex items-center gap-3">
                <span className="text-gray-400">AI Thinking</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
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

    </div>
  );
}

export default App;