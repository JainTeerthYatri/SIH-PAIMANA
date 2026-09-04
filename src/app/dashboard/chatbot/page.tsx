'use client'
import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Sparkles, AlertTriangle, Trash2, HelpCircle } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
}

const QUICK_SUGGESTIONS = [
  "Show projects in Assam",
  "What is the status of BharatNet?",
  "Which projects have major cost overruns?",
  "Give me Railways sector overview"
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'ai', 
      content: 'Namaste! I am the PAIMANA AI Assistant. I am connected directly to the MoSPI infrastructure database. Ask me about project costs, state-wise progress, or potential delays.' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    const newUserMsg: Message = { id: Date.now(), role: 'user', content: query.trim() }
    const updatedMessages = [...messages, newUserMsg]
    
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })) 
        })
      })

      const data = await res.json()
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: data.reply || 'I am the PAIMANA Infrastructure Monitoring Assistant. I can only answer queries related to central sector infrastructure projects.'
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Server connection error. Please ensure your backend API route is properly configured.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        role: 'ai', 
        content: 'Chat history cleared. How else can I assist you with PAIMANA project analytics?' 
      }
    ])
  }

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-2rem)] flex flex-col max-w-5xl mx-auto">
      {/* Header Section with Self-Reflection Counter-Question Badge */}
      <header className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-blue-600" />
            PAIMANA Predictive AI Assistant
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Real-time querying engine backed by MoSPI infrastructure datasets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            title="Clear Chat History"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Main Chat Box Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Chat History Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white font-medium rounded-br-sm shadow-md' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2.5 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-medium text-slate-500">Querying MoSPI database indexes...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (Self-Reflection Enhancement) */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick Ask:
          </span>
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="px-3 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-xs rounded-full whitespace-nowrap transition shadow-2xs disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Security Guardrail Notice */}
        <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex items-center justify-center gap-2 text-amber-700 text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Restricted Domain: Only handles Central Sector Infrastructure & Dataset Analytics queries.
        </div>

        {/* Input Form Bar */}
        <div className="p-3 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a query (e.g., 'Show project costs for Delhi' or 'Find delays')..."
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-3.5 bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm disabled:opacity-50 text-slate-800 placeholder-slate-400"
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