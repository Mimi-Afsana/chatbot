import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Exact .env variable
  const API_KEY = process.env.REACT_APP_OPENAI_KEY;

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      // OpenAI API call
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            { role: "user", content: userMessage },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const botReply = response.data.choices[0].message.content;

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, API call failed 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-purple-700 drop-shadow-md">
        ChatGPT Bot
      </h1>

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-3 mb-4 h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-2xl break-words ${m.role === "user"
              ? "bg-purple-200 text-purple-900 self-end rounded-tr-none"
              : "bg-gray-200 text-gray-800 self-start rounded-tl-none"
              }`}
          >
            <span className="font-semibold">{m.role === "user" ? "You" : "Bot"}: </span>
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-gray-200 text-gray-600 self-start animate-pulse">
            Bot is typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="w-full max-w-md flex gap-3 mt-auto">
        <input
          className="flex-1 p-2 input input-bordered rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="btn bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
