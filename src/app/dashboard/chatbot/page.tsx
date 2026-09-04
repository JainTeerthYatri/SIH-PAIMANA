'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to PAIMANA AI Chatbot. Ask me about infrastructure projects, cost overruns, or state-wise analytics.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'No response received.' }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error connecting to PAIMANA server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto p-4 bg-gray-50 rounded-xl shadow-md border border-gray-200">
      <div className="bg-blue-900 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">PAIMANA AI Assistant</h1>
          <p className="text-xs text-blue-200">MoSPI Infrastructure Monitoring Guardrail System</p>
        </div>
        <span className="bg-green-500 text-xs px-2 py-1 rounded-full font-semibold">Active Guardrail</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500 animate-pulse">Analyzing PAIMANA database...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-gray-100 border-t border-gray-200 flex gap-2 rounded-b-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about project costs, delays, or state progress..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}