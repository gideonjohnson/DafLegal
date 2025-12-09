'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trackCTAClick } from '@/components/Analytics'

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
      {isExpanded ? (
        <div className="card-beige p-4 shadow-2xl w-72 animate-scale-in">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#5c4a3d] hover:text-[#1a2e1a] transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-base font-bold text-[#1a2e1a] mb-2 pr-6">
            Ready to Get Started?
          </h3>
          <p className="text-xs text-[#5c4a3d] mb-4">
            Try our AI-powered contract analysis for free. No credit card required.
          </p>

          <Link
            href="/analyze"
            onClick={() => trackCTAClick('floating_cta', 'Start Free Trial')}
            className="block w-full btn-gold text-xs text-center py-2.5 mb-2"
          >
            Start Free Trial →
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-[#8b7355]">
            <svg className="w-3 h-3 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            14-day free trial
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setIsExpanded(true)
            trackCTAClick('floating_cta', 'expand')
          }}
          className="btn-gold px-6 py-4 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
          aria-label="Get started"
        >
          <span className="font-bold text-sm">Get Started Free</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
