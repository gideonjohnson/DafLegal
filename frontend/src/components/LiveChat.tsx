'use client'

import { useState, useEffect } from 'react'
import { trackButtonClick } from '@/components/Analytics'

// This component provides a custom chat interface
// To integrate with actual chat services, add your provider's script in layout.tsx
// Supported: Intercom, Drift, Help Scout, Crisp, Tawk.to, etc.

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! 👋 Welcome to DafLegal. How can I help you today?',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')

  // Quick reply options
  const quickReplies = [
    { text: 'Pricing info', response: 'Our pricing starts at $99/month for small firms. Would you like to see our full pricing page?' },
    { text: 'Start free trial', response: 'Great! You can start your 14-day free trial immediately with no credit card required. Click "Get Started" to begin!' },
    { text: 'How it works', response: 'DafLegal uses AI to analyze contracts, extract key clauses, identify risks, and ensure compliance. Upload a contract and get instant analysis!' },
    { text: 'Talk to sales', response: 'I\'d be happy to connect you with our sales team. Please email sales@daflegal.com or schedule a demo at your convenience.' }
  ]

  const handleToggleChat = () => {
    const newState = !isOpen
    setIsOpen(newState)
    if (newState) {
      setIsMinimized(false)
      trackButtonClick('live_chat_open', 'chat_widget')
    } else {
      trackButtonClick('live_chat_close', 'chat_widget')
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      text: inputValue,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, userMessage])
    setInputValue('')

    // Auto-response (in production, this would be replaced by actual chat service)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot' as const,
        text: 'Thanks for your message! A member of our team will respond shortly. In the meantime, feel free to explore our features or start a free trial.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)

    trackButtonClick('send_chat_message', 'chat_widget')
  }

  const handleQuickReply = (reply: typeof quickReplies[0]) => {
    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      text: reply.text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, userMessage])

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot' as const,
        text: reply.response,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
    }, 800)

    trackButtonClick(`quick_reply_${reply.text.toLowerCase().replace(/\s+/g, '_')}`, 'chat_widget')
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      const messagesContainer = document.getElementById('chat-messages')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }
  }, [messages, isOpen])

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          className="fixed bottom-28 right-6 z-40 btn-gold w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <svg className="w-8 h-8 text-[#1a2e1a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>

          {/* Notification Pulse */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            1
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-28 right-6 z-40 w-96 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          <div className="card-beige h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2d5a2d] to-[#1a2e1a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4a561] flex items-center justify-center text-[#1a2e1a] font-bold">
                  DL
                </div>
                <div>
                  <h3 className="text-[#f5edd8] font-bold text-sm">DafLegal Support</h3>
                  <div className="flex items-center gap-1 text-xs text-[#d4a561]">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-[#d4a561] hover:text-[#f5edd8] transition-colors p-1"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {isMinimized ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={handleToggleChat}
                  className="text-[#d4a561] hover:text-[#f5edd8] transition-colors p-1"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div
                  id="chat-messages"
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5edd8]/30 dark:bg-[#1a2e1a]/30"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-[#d4a561] text-white'
                            : 'bg-white dark:bg-[#2d5a2d] text-[#1a2e1a] dark:text-[#f5edd8]'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-[#8b7355] dark:text-[#d4a561]'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Replies */}
                {messages.length === 1 && (
                  <div className="p-4 border-t border-[#d4a561]/20 bg-[#f5edd8]/50 dark:bg-[#1a2e1a]/50">
                    <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-2">Quick replies:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-white dark:bg-[#2d5a2d] text-[#1a2e1a] dark:text-[#f5edd8] px-3 py-2 rounded-lg hover:bg-[#d4a561] hover:text-white transition-colors font-medium"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-[#d4a561]/20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-[#2d5a2d] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a561]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="btn-gold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                    We typically reply in a few minutes
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
