'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen leather-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="icon-box-3d w-24 h-24 mx-auto text-[#f5edd8] animate-shake">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="card-beige p-8 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#1a2e1a] mb-4">
              Oops! Something Went Wrong
            </h2>
            <p className="text-base text-[#5c4a3d] mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-[#2d5a2d] hover:text-[#d4a561] mb-2">
                  Technical Details (Dev Mode)
                </summary>
                <div className="bg-[#1a2e1a]/5 p-4 rounded-lg">
                  <pre className="text-xs text-[#1a2e1a] overflow-auto">
                    {error.message}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={reset}
                className="btn-gold text-sm px-6 py-3 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Try Again
              </button>
              <Link
                href="/"
                className="glass-leather px-6 py-3 rounded-xl text-sm font-semibold text-[#1a2e1a] hover:scale-105 transition-all border border-[#d4a561]/30"
              >
                Return Home
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-[#d4a561]/20 pt-6">
              <h3 className="text-sm font-semibold text-[#1a2e1a] mb-3">What you can do:</h3>
              <div className="grid md:grid-cols-3 gap-3 text-left">
                {[
                  {
                    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
                    title: 'Refresh the page',
                    desc: 'Sometimes a simple refresh fixes the issue'
                  },
                  {
                    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
                    title: 'Go back home',
                    desc: 'Start fresh from the homepage'
                  },
                  {
                    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
                    title: 'Contact support',
                    desc: 'We\'re here to help you'
                  }
                ].map((action, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg hover:bg-[#3d6b3d]/5 transition-colors">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#1a2e1a] mb-1">{action.title}</h4>
                      <p className="text-xs text-[#5c4a3d]">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-sm text-[#c4d4c4]">
            Error persists? <Link href="mailto:support@daflegal.com" className="text-[#d4a561] hover:text-[#e8c589] underline">Email our support team</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
