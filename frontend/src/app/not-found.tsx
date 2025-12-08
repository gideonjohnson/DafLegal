'use client'

import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen leather-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated 404 */}
          <div className="mb-8 relative">
            <h1 className="text-9xl font-black text-[#d4a561] opacity-20 select-none animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="icon-box-3d w-24 h-24 text-[#f5edd8] animate-bounce">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="card-beige p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#1a2e1a] mb-4">
              Page Not Found
            </h2>
            <p className="text-base text-[#5c4a3d] mb-6 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted,
              or the URL might be incorrect.
            </p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-2 bg-[#d4a561]/10 px-4 py-2 rounded-lg mb-6">
              <svg className="w-5 h-5 text-[#d4a561] animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="text-sm font-medium text-[#1a2e1a]">
                Redirecting to home in {countdown} seconds...
              </span>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                href="/"
                className="glass-leather px-4 py-3 rounded-lg text-sm font-semibold text-[#1a2e1a] hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Go Home
              </Link>
              <Link
                href="/analyze"
                className="glass-leather px-4 py-3 rounded-lg text-sm font-semibold text-[#1a2e1a] hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Try Analyze
              </Link>
            </div>

            {/* Popular Pages */}
            <div className="border-t border-[#d4a561]/20 pt-6">
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-3">Popular Pages</h3>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { href: '/compare', label: 'Compare Contracts' },
                  { href: '/compliance', label: 'Compliance Checker' },
                  { href: '/drafting', label: 'Drafting Assistant' },
                  { href: '/timeline', label: 'Timeline Builder' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-[#2d5a2d] hover:text-[#d4a561] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-sm text-[#c4d4c4]">
            Need help? <Link href="/#contact" className="text-[#d4a561] hover:text-[#e8c589] underline">Contact support</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
