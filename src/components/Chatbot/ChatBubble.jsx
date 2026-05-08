import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { useISS } from '../../hooks/useISS';
import { useNews } from '../../hooks/useNews';

const HF_API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Hello. How can I help you with the ISS or News data?' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get current context
  const { position, speedHistory } = useISS();
  const { articles } = useNews();

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello. How can I help you with the ISS or News data?' }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => {
      const newHistory = [...prev, userMessage];
      if (newHistory.length > 30) return newHistory.slice(newHistory.length - 30);
      return newHistory;
    });
    setInput('');
    setIsLoading(true);

    try {
      // Build Dashboard Context
      const currentSpeed = speedHistory.length > 0 ? speedHistory[speedHistory.length - 1].speed.toFixed(2) : "Unknown";
      const currentLat = position ? position.lat.toFixed(3) : "Unknown";
      const currentLng = position ? position.lng.toFixed(3) : "Unknown";
      
      const newsContext = articles.slice(0, 10).map((a, i) => `${i + 1}. ${a.title} (${a.source.name})`).join('\n');

      const systemPrompt = `You are a strict dashboard assistant. You MUST ONLY answer questions using the provided dashboard data below. If the user asks something outside this data, you MUST reply EXACTLY with: "I only know dashboard data. I cannot answer that."

DASHBOARD DATA:
ISS Location: Lat ${currentLat}, Lng ${currentLng}
ISS Speed: ${currentSpeed} km/h
Top News Headlines:
${newsContext}

User Query: ${userMessage.content}`;

      const hfToken = import.meta.env.VITE_AI_TOKEN;
      if (!hfToken || hfToken === 'YOUR_HF_TOKEN') {
        throw new Error("Missing AI Token");
      }

      // Format for Mistral Instruct
      const prompt = `<s>[INST] ${systemPrompt} [/INST]`;

      const response = await fetch(HF_API_URL, {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 150, temperature: 0.1 }
        }),
      });

      const result = await response.json();
      
      let aiResponseText = "Sorry, I couldn't generate a response.";
      if (Array.isArray(result) && result[0]?.generated_text) {
         // Extract only the generated part after [/INST]
         aiResponseText = result[0].generated_text.split('[/INST]').pop().trim();
      } else if (result.error) {
         console.error("HF API Error:", result.error);
         aiResponseText = "API Error: " + result.error;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Chat Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform z-40 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-card border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden transform origin-bottom-right transition-all">
          
          {/* Header */}
          <div className="bg-background border-b p-4 flex justify-between items-center">
            <h3 className="font-bold text-foreground">AI Assistant</h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="px-2 py-1 text-xs border rounded-md hover:bg-border/50 text-foreground/70 transition-colors">
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-foreground transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary/20 text-foreground border border-primary/20 rounded-br-sm' 
                    : 'bg-background border text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-foreground/50 flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-background border-t">
            <div className="flex gap-2 items-center bg-card border rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-primary/20">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ISS or News..." 
                className="flex-1 bg-transparent text-sm focus:outline-none"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}
