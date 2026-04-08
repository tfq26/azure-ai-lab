import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Sparkles, Wand2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.content
          }))
        })
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
    <div className="max-w-full mx-auto py-8 h-[90vh] flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 scrollbar-thin scrollbar-thumb-slate-200 px-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
            <div className={`flex max-w-[90%] md:max-w-prose gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`
                w-10 h-10 flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'}
              `}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`
                p-6 shadow-sm border
                ${msg.role === 'user' ? 'bg-slate-50 text-slate-800 border-slate-200' : 'bg-white text-slate-800 border-slate-100'}
              `}>
                {msg.role === 'user' ? (
                   <p className="text-sm font-medium">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-slate-900 mt-8 mb-4 tracking-tighter" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 group" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-slate-600 leading-relaxed text-base" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-600" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-10 border-slate-100" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse px-4">
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
      <div className="max-w-4xl mx-auto w-full relative">
        <div className="group p-4 bg-white border border-slate-200 shadow-xl focus-within:ring-2 focus-within:ring-red-500/20 transition-all rounded-xl">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Ask anything about Texas (e.g. 'Plan a weekend in Dallas with a pool hotel')"
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              disabled={loading || !input.trim()}
              onClick={handleSend}
              className={`
                w-12 h-12 flex items-center justify-center transition-all shadow-md rounded-lg
                ${!input.trim() || loading ? 'bg-slate-100 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5'}
              `}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
