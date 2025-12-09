'use client'

import { useState } from 'react'
import { trackButtonClick } from '@/components/Analytics'

export function NewsletterSignup({ variant = 'default' }: { variant?: 'default' | 'footer' | 'inline' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thanks for subscribing! Check your email to confirm.')
        setEmail('')
        trackButtonClick('newsletter_subscribe', 'email_marketing')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (variant === 'footer') {
    return (
      <div>
        <h3 className="text-lg font-bold text-[#f5edd8] mb-3">Stay Updated</h3>
        <p className="text-sm text-[#d4c5b0] mb-4">
          Get legal tech insights and product updates delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === 'loading'}
            className="w-full px-4 py-2 rounded-lg bg-[#3d6b3d] border border-[#d4a561]/20 text-[#f5edd8] placeholder-[#d4c5b0]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a561] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-gold py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-sm text-green-400 mt-2">{message}</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400 mt-2">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="card-beige p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-3">
            Join 5,000+ Legal Professionals
          </h3>
          <p className="text-[#8b7355] dark:text-[#d4c5b0] mb-6">
            Get weekly insights on legal tech, AI, and contract analysis delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-[#2d5a2d] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] placeholder-[#8b7355] dark:placeholder-[#d4c5b0]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a561] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-gold px-8 py-3 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-4">{message}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-4">{message}</p>
          )}
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="bg-gradient-to-br from-[#2d5a2d] to-[#1a2e1a] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#d4a561]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-[#f5edd8] mb-4">
            Stay Ahead of Legal Tech Trends
          </h2>
          <p className="text-lg text-[#d4c5b0] mb-8">
            Join 5,000+ legal professionals getting weekly insights on AI, contract analysis, and legal innovation.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 rounded-lg bg-[#3d6b3d] border border-[#d4a561]/20 text-[#f5edd8] placeholder-[#d4c5b0]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a561] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-gold px-8 py-4 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-sm text-green-400 mt-4">{message}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-400 mt-4">{message}</p>
          )}
          <p className="text-sm text-[#d4c5b0] mt-6">
            ✓ Weekly insights &nbsp; ✓ No spam &nbsp; ✓ Unsubscribe anytime
          </p>
        </div>
      </div>
    </div>
  )
}
