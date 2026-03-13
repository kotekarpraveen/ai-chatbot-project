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

  const chatEndRef = useRef(null);

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

      const res = await axios.post("http://localhost:5000/chat", {
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

  return (

    <div className="h-screen bg-gray-100 flex flex-col">

      <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold">
        AI Chatbot
      </header>

      <div className="flex-1 overflow-auto p-4">

        {chat.map((c, i) => (

          <div
            key={i}
            className={`mb-3 flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
          >

            <div
              className={`px-4 py-2 rounded-lg max-w-md
  ${c.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white border"}`}
            >
              <ReactMarkdown>{c.text}</ReactMarkdown>
            </div>

          </div>

        ))}

        {loading && (
          <p className="text-gray-500">AI is typing...</p>
        )}

        <div ref={chatEndRef}></div>

      </div>

      <div className="p-4 bg-white border-t flex gap-2">

        <input
          className="flex-1 border rounded p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>

      </div>

    </div>

  );
}

export default App;