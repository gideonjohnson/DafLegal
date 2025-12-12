'use client'

import { useEffect, useState } from 'react'

const notifications = [
  { user: 'Sarah M.', action: 'just analyzed a contract', location: 'New York', time: '2 minutes ago' },
  { user: 'David C.', action: 'started their free trial', location: 'London', time: '5 minutes ago' },
  { user: 'Jennifer P.', action: 'upgraded to Professional', location: 'San Francisco', time: '8 minutes ago' },
  { user: 'Michael R.', action: 'just analyzed a contract', location: 'Toronto', time: '12 minutes ago' },
  { user: 'Emily T.', action: 'started their free trial', location: 'Sydney', time: '15 minutes ago' },
]

export function SocialProofNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(0)

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 5000)

    return () => clearTimeout(initialTimer)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    // Show next notification after 30 seconds
    const nextTimer = setTimeout(() => {
      setCurrentNotification((prev) => (prev + 1) % notifications.length)
      setIsVisible(true)
    }, 30000)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(nextTimer)
    }
  }, [isVisible, currentNotification])

  const notification = notifications[currentNotification]

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 left-6 z-40 animate-slide-in-left">
      <div className="card-beige p-4 shadow-2xl max-w-sm flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#d4a561] flex items-center justify-center text-white font-bold flex-shrink-0">
          {notification.user.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#2d2416] dark:text-[#f5edd8] mb-1 font-medium">
            <span className="font-bold">{notification.user}</span> {notification.action}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#6b5947] dark:text-[#d4c5b0] font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{notification.location}</span>
            <span>•</span>
            <span>{notification.time}</span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[#6b5947] hover:text-[#2d2416] dark:text-[#c4b59f] dark:hover:text-[#f5edd8] transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
