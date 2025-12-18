'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'analyze' | 'compare' | 'draft' | 'research' | 'compliance'
  title: string
  description: string
  timestamp: Date
  icon: string
  color: string
  href?: string
}

// Mock data - replace with real API data
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'analyze',
    title: 'Analyzed Contract.pdf',
    description: 'Employment agreement reviewed with 3 risks identified',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'from-blue-500/20 to-blue-600/20',
    href: '/analyze'
  },
  {
    id: '2',
    type: 'compare',
    title: 'Compared 2 NDAs',
    description: '12 differences found between versions',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-green-500/20 to-green-600/20',
    href: '/compare'
  },
  {
    id: '3',
    type: 'draft',
    title: 'Drafted Service Agreement',
    description: 'Created new template for consulting services',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: 'from-indigo-500/20 to-indigo-600/20',
    href: '/drafting'
  },
  {
    id: '4',
    type: 'compliance',
    title: 'Compliance Check Completed',
    description: 'GDPR compliance verified for privacy policy',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'from-red-500/20 to-red-600/20',
    href: '/compliance'
  },
  {
    id: '5',
    type: 'research',
    title: 'Legal Research Query',
    description: 'Researched precedents for employment termination',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'from-cyan-500/20 to-cyan-600/20',
    href: '/research'
  },
]

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function RecentActivity({ limit = 5 }: { limit?: number }) {
  const [activities] = useState<Activity[]>(mockActivities.slice(0, limit))

  return (
    <div className="bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#d4a561]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a2e1a] dark:text-[#f5edd8] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors"
        >
          View All →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#d4a561]/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
            No recent activity yet
          </p>
          <p className="text-xs text-[#8b7355]/70 dark:text-[#d4c5b0]/70 mt-1">
            Start analyzing documents to see your activity here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Activity Item */}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#d4a561]/5 transition-all duration-200 cursor-pointer">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5 text-[#1a2e1a] dark:text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={activity.icon} />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#1a2e1a] dark:text-[#f5edd8] group-hover:text-[#d4a561] transition-colors">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-[#8b7355] dark:text-[#d4c5b0] whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                {activity.href && (
                  <Link
                    href={activity.href}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Divider (not on last item) */}
              {index < activities.length - 1 && (
                <div className="ml-8 border-l-2 border-[#d4a561]/10 h-3" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#d4a561]/20">
          <Link
            href="/analyze"
            className="block text-center text-sm font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors"
          >
            Start New Analysis →
          </Link>
        </div>
      )}
    </div>
  )
}
