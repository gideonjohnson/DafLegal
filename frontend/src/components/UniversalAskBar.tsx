'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

interface AskBarProps {
  matterId?: string
  matterName?: string
}

interface ConversationHistory {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

export function UniversalAskBar({ matterId, matterName }: AskBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
  const [historySearch, setHistorySearch] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [dragStartY, setDragStartY] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDraggingSheet, setIsDraggingSheet] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Get context from current page
  const getPageContext = () => {
    if (pathname === '/analyze') return 'document_analysis'
    if (pathname === '/timeline') return 'timeline_builder'
    if (pathname === '/compare') return 'contract_comparison'
    if (pathname === '/research') return 'legal_research'
    if (pathname === '/drafting') return 'contract_drafting'
    if (pathname === '/compliance') return 'compliance_checking'
    if (pathname === '/clauses') return 'clause_library'
    if (pathname === '/conveyancing') return 'property_conveyancing'
    if (pathname === '/citations') return 'citation_checking'
    if (pathname === '/intake') return 'client_intake'
    return 'general'
  }

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      // Escape to collapse
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus()
      loadSuggestions()
      loadConversationHistory()
    }
  }, [isExpanded])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for programmatic triggers from pages
  useEffect(() => {
    const handleTriggerAsk = (e: Event) => {
      const customEvent = e as CustomEvent
      const { question } = customEvent.detail
      setIsExpanded(true)
      setInputValue(question)
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    window.addEventListener('trigger-ask', handleTriggerAsk)
    return () => window.removeEventListener('trigger-ask', handleTriggerAsk)
  }, [])

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setDragStartY(touch.clientY)
    setIsDraggingSheet(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSheet) return

    const touch = e.touches[0]
    const diff = touch.clientY - dragStartY

    // Only allow dragging down when expanded, or up when collapsed
    if (isExpanded && diff > 0) {
      setDragOffset(diff)
    } else if (!isExpanded && diff < 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDraggingSheet(false)

    // Threshold for toggling: 80px
    const threshold = 80

    if (isExpanded && dragOffset > threshold) {
      // Swiped down while expanded - collapse
      setIsExpanded(false)
    } else if (!isExpanded && dragOffset < -threshold) {
      // Swiped up while collapsed - expand
      setIsExpanded(true)
    }

    // Reset drag offset with smooth transition
    setDragOffset(0)
  }

  const loadSuggestions = () => {
    const context = getPageContext()
    const suggestionMap: Record<string, string[]> = {
      document_analysis: [
        "Summarize the key risks in this document",
        "What are the payment terms?",
        "Identify all obligations of Party A",
        "Are there any unusual clauses?"
      ],
      timeline_builder: [
        "What are the critical dates in this matter?",
        "Show me all events involving [party name]",
        "Which documents are most important?",
        "Create a summary timeline"
      ],
      contract_comparison: [
        "What are the key differences?",
        "Which version is more favorable?",
        "List all changes to liability clauses",
        "Summarize revisions"
      ],
      legal_research: [
        "Find cases on [topic]",
        "What's the leading authority on [issue]?",
        "Summarize recent developments in [area]",
        "Compare jurisdictions on [topic]"
      ],
      compliance_checking: [
        "Does this comply with [regulation]?",
        "What compliance issues exist?",
        "Check against [jurisdiction] standards",
        "List all non-compliant clauses"
      ],
      general: [
        "How do I use this feature?",
        "Show me an example",
        "What can I do here?",
        "Help me get started"
      ]
    }
    setSuggestions(suggestionMap[context] || suggestionMap.general)
  }

  const loadConversationHistory = () => {
    const saved = localStorage.getItem('askbar-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConversationHistory(parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }

  const saveConversationHistory = (newMessages: Message[]) => {
    if (newMessages.length === 0) return

    const newConversation: ConversationHistory = {
      id: Date.now().toString(),
      title: newMessages[0].content.substring(0, 50) + '...',
      messages: newMessages,
      timestamp: new Date()
    }

    const updated = [newConversation, ...conversationHistory].slice(0, 20)
    setConversationHistory(updated)
    localStorage.setItem('askbar-history', JSON.stringify(updated))
  }

  const loadHistoryConversation = (conversation: ConversationHistory) => {
    setMessages(conversation.messages)
    setShowHistory(false)
  }

  const exportConversation = () => {
    if (messages.length === 0) return

    // Create markdown format
    const markdown = [
      `# DafLegal Conversation`,
      `**Date:** ${new Date().toLocaleString()}`,
      `**Context:** ${getPageContext().replace(/_/g, ' ')}`,
      matterId && matterName ? `**Matter:** ${matterName} (${matterId})` : '',
      '',
      '---',
      '',
      ...messages.map(m =>
        `### ${m.role === 'user' ? '👤 User' : '🤖 Assistant'}\n\n${m.content}\n\n---\n`
      )
    ].filter(Boolean).join('\n')

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daflegal-conversation-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const fetchFollowUpQuestions = async (lastMessages: Message[]) => {
    if (lastMessages.length < 2) return

    try {
      const response = await fetch('http://localhost:8000/api/v1/universal-ask/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          conversation_history: lastMessages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          })),
          context: getPageContext()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFollowUpQuestions(data.follow_ups || [])
      }
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error)
    }
  }

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const formatCitations = (text: string): React.ReactNode => {
    const citationRegex = /\[(\d{4})\]\s+([A-Z]+)\s+(\d+)/g
    const parts = text.split(citationRegex)

    if (parts.length === 1) return text

    return parts.map((part, i) => {
      if (i % 4 === 0) return part
      if (i % 4 === 1) {
        const year = part
        const court = parts[i + 1]
        const number = parts[i + 2]
        const citation = `[${year}] ${court} ${number}`
        return (
          <a
            key={i}
            href={`#`}
            className="text-[#d4b377] hover:text-[#b8965a] underline"
            onClick={(e) => {
              e.preventDefault()
              alert(`Would open: ${citation}`)
            }}
          >
            {citation}
          </a>
        )
      }
      return null
    })
  }

  const simulateStreaming = async (fullText: string, messageIndex: number) => {
    const words = fullText.split(' ')
    let currentText = ''

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i]

      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: currentText,
          streaming: i < words.length - 1
        }
        return newMessages
      })

      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 30))
    }

    setMessages(prev => {
      const newMessages = [...prev]
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        streaming: false
      }
      return newMessages
    })
  }

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputValue.trim()
    if (!query || loading) return

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setIsTyping(true)
    setUploadedFile(null)

    // Auto-expand if collapsed
    if (!isExpanded) setIsExpanded(true)

    try {
      const response = await fetch('http://localhost:8000/api/v1/universal-ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          query,
          context: getPageContext(),
          matter_id: matterId,
          current_page: pathname
        })
      })

      if (!response.ok) {
        throw new Error('Ask request failed')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)

      const messageIndex = messages.length + 1
      await simulateStreaming(data.response, messageIndex)

      const finalMessages = [...messages, userMessage, { ...assistantMessage, content: data.response }]
      saveConversationHistory(finalMessages)

      // Fetch AI-powered follow-up suggestions
      await fetchFollowUpQuestions(finalMessages)

    } catch (error) {
      console.error('Ask error:', error)
      setIsTyping(false)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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
      handleSend()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  return (
    <>
      {/* Backdrop overlay for mobile when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
          style={{ opacity: isExpanded ? 1 : 0 }}
        />
      )}

      {/* Ask Bar - Bottom sheet on mobile, traditional on desktop */}
      <div
        ref={sheetRef}
        className={`fixed left-0 right-0 z-50 transition-all ${
          isDraggingSheet ? 'duration-0' : 'duration-300'
        } ease-out`}
        style={{
          bottom: 0,
          height: isExpanded ? '60vh' : '72px',
          maxHeight: isExpanded ? '60vh' : '72px',
          transform: isDraggingSheet ? `translateY(${dragOffset}px)` : 'translateY(0)',
          background: 'linear-gradient(180deg, rgba(26, 46, 26, 0.98) 0%, rgba(29, 52, 29, 0.99) 100%)',
          backdropFilter: 'blur(20px)',
          borderTopLeftRadius: isExpanded ? '24px' : '20px',
          borderTopRightRadius: isExpanded ? '24px' : '20px',
          boxShadow: isExpanded
            ? '0 -20px 60px rgba(0, 0, 0, 0.5), 0 -4px 12px rgba(0, 0, 0, 0.3)'
            : '0 -10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* History Sidebar */}
        {showHistory && isExpanded && (
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#1a2e1a]/95 border-r border-[#3d6b3d]/30 z-10">
            <div className="p-4 border-b border-[#3d6b3d]/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#f5edd8]">History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-[#3d6b3d]/30 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 100px)' }}>
              {conversationHistory
                .filter(c =>
                  historySearch === '' ||
                  c.title.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => loadHistoryConversation(conversation)}
                    className="w-full p-3 text-left hover:bg-[#3d6b3d]/30 border-b border-[#3d6b3d]/10 transition-colors"
                  >
                    <p className="text-sm text-[#f5edd8] truncate">{conversation.title}</p>
                    <p className="text-xs text-[#a8c4a8] mt-1">
                      {conversation.timestamp.toLocaleDateString()}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="h-full flex flex-col max-w-7xl mx-auto">
          {/* Mobile Drag Handle - Only visible on mobile */}
          <div
            className="md:hidden pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-[#a8c4a8]/40 rounded-full" />
          </div>

          {/* Input Bar - At TOP when expanded on MOBILE ONLY */}
          {isExpanded && (
            <div className="md:hidden px-3 py-3 border-b border-[#3d6b3d]/20 order-first">
              <div className="flex gap-2 items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                />

                {/* Left action buttons - stacked vertically on mobile for better reach */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 hover:bg-[#3d6b3d]/30 rounded-xl transition-colors flex-shrink-0 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
                    title="Upload"
                  >
                    <svg className="w-5 h-5 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleVoiceRecording}
                    className={`p-3 hover:bg-[#3d6b3d]/30 rounded-xl transition-all flex-shrink-0 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center ${
                      isRecording ? 'bg-red-500/20 animate-pulse' : ''
                    }`}
                    title={isRecording ? "Stop" : "Voice"}
                  >
                    <svg className={`w-5 h-5 ${isRecording ? 'text-red-500' : 'text-[#a8c4a8]'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>

                {/* Input field - larger touch target on mobile */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 bg-[#234023]/50 text-[#f5edd8] placeholder-[#a8c4a8] px-4 py-3.5 rounded-2xl border border-[#3d6b3d]/30 focus:border-[#d4b377] focus:ring-2 focus:ring-[#d4b377]/20 transition-all text-base touch-manipulation min-h-[48px]"
                  disabled={loading}
                  style={{ fontSize: '16px' }}
                />

                {/* Send button - optimized for right-thumb on mobile */}
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || loading}
                  className="btn-gold px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105 transition-transform touch-manipulation min-w-[48px] min-h-[48px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Compact Header for Mobile (at bottom when expanded), Full Header for Desktop */}
          <div className={`flex items-center justify-between px-4 md:px-6 py-2 md:py-3 ${isExpanded ? 'md:border-b' : 'border-b'} border-[#3d6b3d]/20 ${isExpanded ? 'order-last md:order-first' : ''}`}>
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-[#3d6b3d]/30 rounded-lg transition-all flex-shrink-0 touch-manipulation"
              >
                <svg
                  className={`w-5 h-5 text-[#d4b377] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-[#d4b377] to-[#b8965a] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#1a2e1a]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#f5edd8] text-base md:text-lg truncate">Ask DafLegal</h3>
                {isExpanded && (
                  <p className="text-xs text-[#a8c4a8] truncate">
                    {matterId && matterName ? `${matterName}` : `${getPageContext().replace(/_/g, ' ')}`}
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {isExpanded && (
                <>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2.5 md:p-2 hover:bg-[#3d6b3d]/30 rounded-lg transition-colors touch-manipulation"
                    title="History"
                  >
                    <svg className="w-5 h-5 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setMessages([])
                      setInputValue('')
                      setFollowUpQuestions([])
                    }}
                    className="p-2.5 md:p-2 hover:bg-[#3d6b3d]/30 rounded-lg transition-colors touch-manipulation"
                    title="New Chat"
                  >
                    <svg className="w-5 h-5 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                  <button
                    onClick={exportConversation}
                    disabled={messages.length === 0}
                    className="hidden md:block p-2 hover:bg-[#3d6b3d]/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    title="Export"
                  >
                    <svg className="w-5 h-5 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </>
              )}
              <kbd className="hidden lg:inline-block px-3 py-1.5 text-xs font-mono bg-[#3d6b3d]/30 text-[#d4b377] rounded-lg border border-[#3d6b3d]/40">
                {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
              </kbd>
            </div>
          </div>

          {/* Messages - Only visible when expanded */}
          {isExpanded && (
            <div
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-4 border-2 border-dashed border-[#d4b377] rounded-2xl bg-[#1a2e1a]/90 flex items-center justify-center z-20">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-[#d4b377] mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-[#d4b377] font-bold text-lg">Drop document to analyze</p>
                    <p className="text-[#a8c4a8] text-sm mt-2">PDF, DOCX, TXT supported</p>
                  </div>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="py-4 md:py-8 max-w-3xl mx-auto px-2">
                  <p className="text-center text-[#a8c4a8] mb-4 md:mb-6 text-sm md:text-lg">
                    Ask me anything about your legal work. I'm aware of your current context.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="card-glass p-3 md:p-4 text-left text-sm text-[#a8c4a8] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30 transition-all active:scale-95 md:hover:scale-105 touch-manipulation min-h-[56px] flex items-start gap-2"
                      >
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#d4b377]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="flex-1">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 px-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'user' ? (
                        <div className="card-beige p-3 md:p-4 max-w-[85%] md:max-w-[75%] rounded-2xl">
                          <p className="text-[#1a2e1a] text-sm md:text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      ) : (
                        <div className="card-glass p-3 md:p-4 max-w-[90%] md:max-w-[85%] rounded-2xl">
                          <p className="text-[#f5edd8] text-sm md:text-sm whitespace-pre-wrap leading-relaxed">
                            {formatCitations(msg.content)}
                            {msg.streaming && <span className="inline-block w-2 h-4 bg-[#d4b377] ml-1 animate-pulse"></span>}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="card-glass p-4 flex items-center gap-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#d4b377] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-[#d4b377] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-[#d4b377] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-[#a8c4a8]">Thinking...</span>
                      </div>
                    </div>
                  )}

                  {/* Smart Follow-up Suggestions - Mobile optimized */}
                  {followUpQuestions.length > 0 && !isTyping && !loading && (
                    <div className="mt-4 md:mt-6 max-w-4xl mx-auto px-2">
                      <p className="text-xs md:text-sm text-[#a8c4a8] mb-2 md:mb-3 font-semibold">💡 Follow-up:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {followUpQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(question)}
                            className="card-glass p-3 text-left text-sm text-[#a8c4a8] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30 transition-all active:scale-95 md:hover:scale-105 flex items-center gap-2 touch-manipulation min-h-[48px]"
                          >
                            <svg className="w-4 h-4 text-[#d4b377] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                            <span className="flex-1">{question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}

          {/* File Upload Preview */}
          {uploadedFile && (
            <div className="px-6 py-2 border-t border-[#3d6b3d]/20">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#d4b377]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-[#f5edd8]">{uploadedFile.name}</span>
                  <span className="text-xs text-[#a8c4a8]">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-1 hover:bg-[#3d6b3d]/30 rounded"
                >
                  <svg className="w-4 h-4 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Bar - At BOTTOM when collapsed on mobile, always at bottom on desktop */}
          <div className={`px-3 md:px-6 py-3 md:py-4 border-t border-[#3d6b3d]/20 pb-safe ${isExpanded ? 'hidden md:block' : 'block'} order-last`}>
              <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                />

                {/* Left action buttons - stacked vertically on mobile for better reach */}
                <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 md:p-3 hover:bg-[#3d6b3d]/30 rounded-xl transition-colors flex-shrink-0 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
                    title="Upload"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-[#a8c4a8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleVoiceRecording}
                    className={`p-3 md:p-3 hover:bg-[#3d6b3d]/30 rounded-xl transition-all flex-shrink-0 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center ${
                      isRecording ? 'bg-red-500/20 animate-pulse' : ''
                    }`}
                    title={isRecording ? "Stop" : "Voice"}
                  >
                    <svg className={`w-5 h-5 md:w-6 md:h-6 ${isRecording ? 'text-red-500' : 'text-[#a8c4a8]'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>

                {/* Input field - larger touch target on mobile */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => !isExpanded && setIsExpanded(true)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-[#234023]/50 text-[#f5edd8] placeholder-[#a8c4a8] px-4 md:px-6 py-3.5 md:py-4 rounded-2xl border border-[#3d6b3d]/30 focus:border-[#d4b377] focus:ring-2 focus:ring-[#d4b377]/20 transition-all text-base md:text-base touch-manipulation min-h-[48px]"
                  disabled={loading}
                  style={{ fontSize: '16px' }}
                />

                {/* Send button - optimized for right-thumb on mobile */}
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || loading}
                  className="btn-gold px-5 md:px-8 py-3.5 md:py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105 transition-transform touch-manipulation min-w-[48px] min-h-[48px]"
                >
                  <span className="font-bold hidden md:inline">Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the bar */}
      <div className="h-[80px] md:h-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </>
  )
}
