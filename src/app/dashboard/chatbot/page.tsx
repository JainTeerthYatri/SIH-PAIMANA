'use client'
import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Sparkles, AlertTriangle } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'ai', 
      content: 'Namaste! I am the PAIMANA AI Assistant. I am connected to the MoSPI database. Ask me to predict cost overruns, analyze state-wise delays, or evaluate specific project risks.' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // 1. Add user message to UI
    const newUserMsg: Message = { id: Date.now(), role: 'user', content: input }
    setMessages((prev) => [...prev, newUserMsg])
    setInput('')
    setIsLoading(true)

    // 2. TODO: Here we will call the Python FastAPI ML Backend
    // For now, simulating the AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: `Based on current historical data models, projects similar to your query have a high probability of a 15-20% cost overrun. I strongly recommend reviewing the "Critical Risk Escalations" list on the main dashboard.`
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col max-w-5xl mx-auto">
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          Predictive AI Assistant
        </h1>
        <p className="text-slate-500 mt-1">Chat with our Machine Learning model for instant project insights</p>
      </header>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-sm shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-slate-500">AI is analyzing data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Security Warning */}
        <div className="px-6 py-2 bg-amber-50 border-y border-amber-100 flex items-center justify-center gap-2 text-amber-700 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4" />
          AI predictions are for advisory purposes only. Always verify with official ground reports.
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about project risks, cost overruns, or sector analysis..."
              disabled={isLoading}
              className="w-full pl-6 pr-16 py-4 bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  )
}