'use client'

import Link from 'next/link'
import { useState } from 'react'

export function QuickActions() {
  const [showUpload, setShowUpload] = useState(false)

  const quickActions = [
    {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      label: 'Analyze Contract',
      href: '/analyze',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      label: 'Compare Docs',
      href: '/compare',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      label: 'Draft Contract',
      href: '/drafting',
      color: 'from-indigo-500/20 to-indigo-600/20',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
  ]

  return (
    <div className="bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#d4a561]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
          Quick Actions
        </h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="p-2 rounded-lg bg-[#d4a561]/10 hover:bg-[#d4a561]/20 transition-colors"
          aria-label="Upload"
        >
          <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#d4a561]/10 transition-all hover:scale-105 group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <svg className={`w-6 h-6 ${action.textColor}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
            </div>
            <span className="text-xs font-medium text-center text-[#1a2e1a] dark:text-[#f5edd8]">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function UsageStats() {
  // In real app, these would come from API
  const stats = [
    { label: 'Analyses', value: 23, limit: 100, color: 'bg-blue-500' },
    { label: 'Drafts', value: 8, limit: 50, color: 'bg-indigo-500' },
    { label: 'Comparisons', value: 12, limit: 50, color: 'bg-green-500' },
  ]

  return (
    <div className="bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#d4a561]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
          Usage This Month
        </h3>
        <Link
          href="/pricing"
          className="text-xs font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors"
        >
          Upgrade →
        </Link>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8]">
                {stat.label}
              </span>
              <span className="text-sm font-bold text-[#d4a561]">
                {stat.value}/{stat.limit}
              </span>
            </div>
            <div className="h-2 bg-[#d4a561]/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                style={{ width: `${(stat.value / stat.limit) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#d4a561]/20">
        <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
          You're on the <span className="font-bold text-[#d4a561]">Free</span> plan
        </p>
      </div>
    </div>
  )
}
