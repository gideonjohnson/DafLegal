"use client"
import Image from 'next/image'

import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'

interface Citation {
  id: string
  type: string
  title: string
  citation: string
  court?: string
  date?: string
  jurisdiction?: string
  relevance: string
  key_quote?: string
  url?: string
  verified: boolean
  format_valid?: boolean
}

interface ResearchSummary {
  query_type: string
  jurisdiction: string
  sources_searched: string[]
  confidence_level: string
  limitations?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  follow_up_questions?: string[]
  research_summary?: ResearchSummary
  timestamp: Date
}

export default function ResearchPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [jurisdiction, setJurisdiction] = useState('AU')
  const [showSettings, setShowSettings] = useState(false)
  const [includeCases, setIncludeCases] = useState(true)
  const [includeStatutes, setIncludeStatutes] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim()
    if (!messageText || loading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/v1/research/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          query: messageText,
          conversation_id: conversationId,
          jurisdiction,
          include_cases: includeCases,
          include_statutes: includeStatutes
        })
      })

      if (!response.ok) {
        throw new Error('Research request failed')
      }

      const data = await response.json()
      setConversationId(data.conversation_id)

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        follow_up_questions: data.follow_up_questions,
        research_summary: data.research_summary,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Research error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your research request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetConversation = () => {
    setMessages([])
    setConversationId(null)
    setInputValue('')
  }

  const jurisdictions = [
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' }
  ]

  const exampleQueries = [
    "What is the test for negligence in tort law?",
    "Summarize recent developments in contract interpretation",
    "What are the requirements for valid consideration?",
    "Find cases on duty of care in professional negligence"
  ]

  return (
    <div className="min-h-screen leather-bg relative overflow-hidden">
      {/* Background Image with Green Blend */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/webimg2.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e1a]/90 via-[#234023]/85 to-[#2d5a2d]/90"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
      <Navigation />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="icon-box-3d w-14 h-14">
                  <svg className="w-7 h-7 text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <h1 className="heading-lg">Legal Research AI</h1>
                  <p className="text-[#a8c4a8] text-lg mt-1">Conversational research with verified citations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                {messages.length > 0 && (
                  <button onClick={resetConversation} className="btn-ghost flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    New Conversation
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Settings & Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Jurisdiction Selector */}
              <div className="card-dark p-5">
                <h3 className="font-bold text-[#f5edd8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Jurisdiction
                </h3>
                <div className="space-y-2">
                  {jurisdictions.map(j => (
                    <button
                      key={j.value}
                      onClick={() => setJurisdiction(j.value)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                        jurisdiction === j.value
                          ? 'bg-[#3d6b3d] text-[#f5edd8]'
                          : 'bg-[#1a2e1a]/30 text-[#a8c4a8] hover:bg-[#2d5a2d]/50'
                      }`}
                    >
                      <span className="text-2xl">{j.flag}</span>
                      <span className="font-medium">{j.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filters */}
              <div className="card-dark p-5">
                <h3 className="font-bold text-[#f5edd8] mb-4">Source Filters</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCases}
                      onChange={(e) => setIncludeCases(e.target.checked)}
                      className="w-5 h-5 rounded accent-[#d4b377]"
                    />
                    <span className="text-[#a8c4a8]">Case Law</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeStatutes}
                      onChange={(e) => setIncludeStatutes(e.target.checked)}
                      className="w-5 h-5 rounded accent-[#d4b377]"
                    />
                    <span className="text-[#a8c4a8]">Statutes & Legislation</span>
                  </label>
                </div>
              </div>

              {/* Stats */}
              {conversationId && (
                <div className="card-glass p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#f5edd8]">{messages.filter(m => m.role === 'user').length}</p>
                    <p className="text-sm text-[#a8c4a8]">Questions Asked</p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="card-dark flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="icon-box-3d w-20 h-20 mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#f5edd8] mb-3">Start Your Legal Research</h3>
                      <p className="text-[#a8c4a8] mb-8 max-w-2xl mx-auto">
                        Ask me anything about law in your jurisdiction. I'll provide answers with verified citations from trusted legal databases.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                        {exampleQueries.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="card-glass p-4 text-left hover:bg-[#3d6b3d]/30 transition-all text-[#a8c4a8] hover:text-[#f5edd8]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl ${msg.role === 'user' ? 'w-full' : 'w-full'}`}>
                          {msg.role === 'user' ? (
                            <div className="card-beige p-4 ml-12">
                              <p className="text-[#1a2e1a] whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="card-glass p-6">
                                <p className="text-[#f5edd8] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                              </div>

                              {/* Citations */}
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-[#d4b377] uppercase">Citations</h4>
                                  {msg.citations.map((cite, cidx) => (
                                    <div key={cidx} className="card-glass p-4 border-l-4 border-[#d4b377]">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="font-bold text-[#f5edd8]">{cite.title}</p>
                                          <p className="text-sm text-[#d4b377] font-mono mt-1">{cite.citation}</p>
                                        </div>
                                        {cite.verified && (
                                          <span className="badge-success text-xs">Verified</span>
                                        )}
                                      </div>
                                      {cite.court && <p className="text-xs text-[#a8c4a8] mb-1">{cite.court} • {cite.date}</p>}
                                      <p className="text-sm text-[#a8c4a8] mt-2">{cite.relevance}</p>
                                      {cite.key_quote && (
                                        <blockquote className="mt-3 pl-4 border-l-2 border-[#3d6b3d] text-sm italic text-[#e5d9c3]">
                                          "{cite.key_quote}"
                                        </blockquote>
                                      )}
                                      {cite.url && (
                                        <a
                                          href={cite.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 mt-3 text-sm text-[#d4b377] hover:text-[#b8965a]"
                                        >
                                          View Source
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Follow-up Questions */}
                              {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold text-[#d4b377] uppercase mb-3">Follow-up Questions</h4>
                                  <div className="grid gap-2">
                                    {msg.follow_up_questions.map((q, qidx) => (
                                      <button
                                        key={qidx}
                                        onClick={() => handleSendMessage(q)}
                                        className="card-glass p-3 text-left text-sm text-[#a8c4a8] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30 transition-all"
                                      >
                                        {q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Research Summary */}
                              {msg.research_summary && (
                                <div className="card-glass p-4 text-xs text-[#a8c4a8]">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <span className="font-semibold block mb-1">Query Type</span>
                                      <span className="capitalize">{msg.research_summary.query_type}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold block mb-1">Jurisdiction</span>
                                      <span>{msg.research_summary.jurisdiction}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold block mb-1">Sources</span>
                                      <span>{msg.research_summary.sources_searched.join(', ')}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold block mb-1">Confidence</span>
                                      <span className="capitalize">{msg.research_summary.confidence_level}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="card-glass p-4">
                        <div className="flex items-center gap-3">
                          <div className="spinner" />
                          <span className="text-[#a8c4a8]">Researching...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-[#3d6b3d]/30 p-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a legal research question..."
                      className="input flex-1"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || loading}
                      className="btn-gold px-6"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-[#a8c4a8] mt-3 text-center">
                    All citations are verified against trusted legal databases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
      </div>
  )
}
