import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Sparkles, Wand2 } from 'lucide-react'

export default function TripTab() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Welcome to Texas! I am your AI travel guide. How can I help you plan your perfect Lone Star adventure today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.response }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to the Texas AI. Check your backend!" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 h-[calc(100vh-12rem)] flex flex-col">
      {/* Header Info */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Trip Planner <Sparkles className="text-red-500" size={20} />
          </h2>
          <p className="text-slate-500 text-sm">Powered by Azure OpenAI & 40,000 Texas data points.</p>
        </div>
        <div className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1 uppercase tracking-widest">
          RAG Mode Active
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 scrollbar-thin scrollbar-thumb-slate-200">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`
                w-10 h-10 flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'}
              `}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`
                p-4 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-white border text-slate-800'}
              `}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-100 p-4 flex gap-2">
              <div className="w-2 h-2 bg-slate-400 animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-slate-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative group p-4 bg-white border border-slate-200 shadow-lg focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
        <div className="absolute -top-4 left-6 bg-slate-900 text-white px-3 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
          <Wand2 size={12} /> Student Challenge: The Cloud Orchestrator
        </div>
        
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Ask anything about Texas (e.g. 'Plan a weekend in Dallas with a pool hotel')"
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            disabled={loading || !input.trim()}
            onClick={handleSend}
            className={`
              w-12 h-12 flex items-center justify-center transition-all shadow-md
              ${!input.trim() || loading ? 'bg-slate-100 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700 hover:rotate-12'}
            `}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      <p className="text-center text-[10px] uppercase tracking-widest text-slate-400 mt-4 font-bold">
        Azure Foundry · Prompt Flow · GPT-4o · RAG Integration
      </p>
    </div>
  )
}
