'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trackExitIntent } from '@/components/Analytics'

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if user has already seen the popup in this session
    if (sessionStorage.getItem('exitIntentShown')) {
      setHasShown(true)
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger only when mouse leaves from top of viewport
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('exitIntentShown', 'true')
        trackExitIntent('shown')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [hasShown])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsVisible(false)}
      />

      {/* Popup */}
      <div className="relative card-beige p-8 max-w-lg w-full shadow-2xl animate-scale-in">
        <button
          onClick={() => {
            setIsVisible(false)
            trackExitIntent('dismissed')
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#5c4a3d] hover:text-[#1a2e1a] transition-colors rounded-full hover:bg-[#d4a561]/10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="icon-box-3d w-16 h-16 mx-auto mb-4 text-[#f5edd8]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-3 text-center">
          Wait! Don't Leave Empty-Handed
        </h3>

        <p className="text-base text-[#3d2f28] dark:text-[#e8dcc8] mb-6 text-center leading-relaxed">
          Start your <span className="font-semibold text-[#b8965a] dark:text-[#d4a561]">14-day free trial</span> and discover how DafLegal can transform your legal workflow.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {[
            'Analyze unlimited contracts for 14 days',
            'No credit card required to start',
            'Access to all premium features',
            'Cancel anytime, no questions asked'
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#d4a561] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-[#2d2416] dark:text-[#f5edd8] font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/analyze"
          onClick={() => {
            setIsVisible(false)
            trackExitIntent('clicked')
          }}
          className="block w-full btn-gold text-center py-3.5 mb-3 text-base font-bold"
        >
          Start My Free Trial →
        </Link>

        <button
          onClick={() => {
            setIsVisible(false)
            trackExitIntent('dismissed')
          }}
          className="block w-full text-center text-sm text-[#6b5947] dark:text-[#c4b59f] hover:text-[#3d2f28] dark:hover:text-[#f5edd8] transition-colors font-medium"
        >
          No thanks, I'll browse more
        </button>

        {/* Trust Badge */}
        <div className="mt-6 pt-6 border-t border-[#d4a561]/20 flex items-center justify-center gap-4 text-xs text-[#6b5947] dark:text-[#c4b59f] font-medium">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure & Private
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            500+ Law Firms
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
