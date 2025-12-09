'use client'

import { useEffect, useState } from 'react'
import { trackButtonClick } from '@/components/Analytics'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 30) { // Don't show again for 30 days
        return
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    trackButtonClick(`pwa_install_${outcome}`, 'pwa')

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    trackButtonClick('pwa_install_dismissed', 'pwa')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm animate-slide-in-right">
      <div className="card-beige p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1">
            <img src="/logo.png" alt="DafLegal" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
              Install DafLegal App
            </h3>
            <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-4">
              Get faster access and work offline. Install our app on your device.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="btn-gold px-4 py-2 text-sm rounded-lg"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="border border-[#d4a561] text-[#1a2e1a] dark:text-[#f5edd8] px-4 py-2 text-sm rounded-lg hover:bg-[#d4a561]/10 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#8b7355] hover:text-[#1a2e1a] dark:hover:text-[#f5edd8]"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
