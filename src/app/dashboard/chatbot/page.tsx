'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Sparkles, AlertTriangle, Trash2, HelpCircle, Database, Activity } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
}

const QUICK_SUGGESTIONS = [
  "Which projects have major cost overruns?",
  "Show projects in Assam",
  "What is the status of BharatNet?",
  "Give me Railways sector overview"
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'ai', 
      content: '### 🇮🇳 PAIMANA MoSPI AI Assistant Connected\nWelcome! I am connected live to the **MoSPI Supabase PostgreSQL Database**. Ask me to analyze state-wise progress, identify cost overruns, or evaluate Central Sector infrastructure risks.' 
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
          messages: updatedMessages.map(m => ({ 
            role: m.role === 'ai' ? 'assistant' : 'user', 
            content: m.content 
          })) 
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
        content: 'Server connection error. Please verify network status or database API keys.'
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
        content: 'Chat session reset. How else can I assist you with PAIMANA infrastructure analytics?' 
      }
    ])
  }

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-2rem)] flex flex-col max-w-6xl mx-auto font-sans">
      {/* Header Section */}
      <header className="mb-4 shrink-0 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                PAIMANA AI Infrastructure Assistant
              </h1>
              <span className="hidden md:flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Live DB Connected
              </span>
            </div>
            <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" /> MoSPI Supabase Engine • Zero-Hallucination Predictive Analytics
            </p>
          </div>
        </div>
        
        <button 
          onClick={clearChat}
          title="Reset Chat"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-slate-600" />
          <span>Reset Session</span>
        </button>
      </header>

      {/* Main Chat Box */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/60">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-blue-700 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[92%] md:max-w-[82%] p-4 md:p-5 rounded-2xl text-sm leading-relaxed overflow-hidden ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white font-medium rounded-br-xs shadow-md whitespace-pre-wrap' 
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
              }`}>
                {msg.role === 'ai' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm border border-blue-700">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-xs flex items-center gap-3 shadow-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-700">Querying MoSPI Supabase DB & generating analytical response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-slate-100/80 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Prompts:
          </span>
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-900 hover:text-blue-900 text-xs font-semibold rounded-full whitespace-nowrap transition shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Security / Guardrail Banner */}
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-center gap-2 text-amber-900 text-[11px] font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          Active Guardrail: Restricted to Official MoSPI Central Sector Infrastructure Analytics.
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about state progress, cost overruns, or sector analysis..."
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-3.5 bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none text-sm disabled:opacity-50 text-slate-900 font-semibold placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}