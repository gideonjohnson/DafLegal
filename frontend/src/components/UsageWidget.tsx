'use client'

import { useState } from 'react'
import Link from 'next/link'

interface UsageMetric {
  id: string
  name: string
  current: number
  limit: number
  previousPeriod: number
  icon: string
  color: string
  category: 'analysis' | 'generation' | 'storage'
}

// Mock data - replace with real API data
const mockUsageData: UsageMetric[] = [
  {
    id: 'analysis',
    name: 'Contract Analysis',
    current: 23,
    limit: 100,
    previousPeriod: 18,
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'from-blue-500 to-blue-600',
    category: 'analysis'
  },
  {
    id: 'comparison',
    name: 'Document Comparisons',
    current: 8,
    limit: 50,
    previousPeriod: 12,
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-green-500 to-green-600',
    category: 'analysis'
  },
  {
    id: 'drafting',
    name: 'Contract Drafts',
    current: 15,
    limit: 30,
    previousPeriod: 10,
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: 'from-indigo-500 to-indigo-600',
    category: 'generation'
  },
  {
    id: 'compliance',
    name: 'Compliance Checks',
    current: 12,
    limit: 40,
    previousPeriod: 15,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'from-red-500 to-red-600',
    category: 'analysis'
  },
  {
    id: 'storage',
    name: 'Document Storage',
    current: 2.4,
    limit: 10,
    previousPeriod: 1.8,
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    color: 'from-purple-500 to-purple-600',
    category: 'storage'
  }
]

type TimePeriod = 'week' | 'month' | 'year'

export function UsageWidget() {
  const [period, setPeriod] = useState<TimePeriod>('month')
  const [metrics] = useState<UsageMetric[]>(mockUsageData)

  // Calculate total usage percentage
  const totalUsage = metrics.reduce((sum, m) => sum + (m.current / m.limit * 100), 0) / metrics.length

  // Calculate trend
  const calculateTrend = (current: number, previous: number): { percentage: number; direction: 'up' | 'down' | 'stable' } => {
    if (previous === 0) return { percentage: 100, direction: 'up' }
    const change = ((current - previous) / previous) * 100
    if (Math.abs(change) < 5) return { percentage: Math.abs(change), direction: 'stable' }
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : 'down'
    }
  }

  // Get usage status
  const getUsageStatus = (percentage: number): { color: string; label: string; bgColor: string } => {
    if (percentage >= 90) return {
      color: 'text-red-600 dark:text-red-400',
      label: 'Critical',
      bgColor: 'bg-red-500/20'
    }
    if (percentage >= 75) return {
      color: 'text-yellow-600 dark:text-yellow-400',
      label: 'High',
      bgColor: 'bg-yellow-500/20'
    }
    if (percentage >= 50) return {
      color: 'text-blue-600 dark:text-blue-400',
      label: 'Moderate',
      bgColor: 'bg-blue-500/20'
    }
    return {
      color: 'text-green-600 dark:text-green-400',
      label: 'Healthy',
      bgColor: 'bg-green-500/20'
    }
  }

  const overallStatus = getUsageStatus(totalUsage)

  return (
    <div className="bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#d4a561]/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#1a2e1a] dark:text-[#f5edd8] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Usage & Analytics
          </h3>
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-1">
            Track your monthly usage and limits
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-[#d4a561]/10 rounded-lg p-1">
          {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
                ${period === p
                  ? 'bg-[#d4a561] text-white shadow-sm'
                  : 'text-[#8b7355] dark:text-[#d4c5b0] hover:bg-[#d4a561]/20'
                }
              `}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Usage Card */}
      <div className={`mb-6 p-4 rounded-xl ${overallStatus.bgColor} border border-[#d4a561]/20`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-[#8b7355] dark:text-[#d4c5b0] uppercase tracking-wider">
              Overall Usage
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold ${overallStatus.color}`}>
                {totalUsage.toFixed(0)}%
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${overallStatus.bgColor} ${overallStatus.color}`}>
                {overallStatus.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">This {period}</p>
            <p className="text-sm font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mt-1">
              {metrics.reduce((sum, m) => sum + m.current, 0).toFixed(m => m.category === 'storage' ? 1 : 0)} / {metrics.reduce((sum, m) => sum + m.limit, 0)} total
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative h-2 bg-white/50 dark:bg-[#1a2e1a]/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d4a561] to-[#b8965a] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(totalUsage, 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-4 mb-6">
        {metrics.map((metric) => {
          const percentage = (metric.current / metric.limit) * 100
          const trend = calculateTrend(metric.current, metric.previousPeriod)
          const status = getUsageStatus(percentage)

          return (
            <div key={metric.id} className="group">
              {/* Metric Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <svg className={`w-4 h-4 text-[#1a2e1a] dark:text-[#f5edd8]`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} />
                    </svg>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] truncate">
                      {metric.name}
                    </h4>
                  </div>

                  {/* Trend Indicator */}
                  <div className={`
                    flex items-center gap-1 text-xs font-medium
                    ${trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : trend.direction === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}
                  `}>
                    {trend.direction === 'up' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend.direction === 'down' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend.direction === 'stable' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{trend.percentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Usage Count */}
                <div className="ml-4 text-right">
                  <p className="text-sm font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
                    {metric.category === 'storage' ? `${metric.current} GB` : metric.current}
                    <span className="text-xs font-normal text-[#8b7355] dark:text-[#d4c5b0]">
                      {' '}/ {metric.category === 'storage' ? `${metric.limit} GB` : metric.limit}
                    </span>
                  </p>
                  <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-[#d4a561]/10 rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-y-0 left-0 bg-gradient-to-r ${metric.color} rounded-full
                    transition-all duration-500 group-hover:shadow-lg
                    ${percentage >= 90 ? 'animate-pulse' : ''}
                  `}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Warning for high usage */}
              {percentage >= 75 && (
                <p className={`text-xs ${status.color} mt-1 flex items-center gap-1`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {percentage >= 90 ? 'Approaching limit - upgrade recommended' : 'High usage detected'}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#d4a561]/20 space-y-2">
        {/* Upgrade CTA (show if any metric > 75%) */}
        {metrics.some(m => (m.current / m.limit) * 100 >= 75) && (
          <Link
            href="/pricing"
            className="block w-full px-4 py-3 bg-gradient-to-r from-[#d4a561] to-[#b8965a] text-white text-center text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade for More Usage
            </span>
          </Link>
        )}

        {/* View Details */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/dashboard/usage"
            className="text-[#d4a561] hover:text-[#b8965a] transition-colors font-medium flex items-center gap-1"
          >
            View Detailed Analytics
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <span className="text-[#8b7355] dark:text-[#d4c5b0]">
            Resets in {period === 'week' ? '4 days' : period === 'month' ? '12 days' : '3 months'}
          </span>
        </div>
      </div>
    </div>
  )
}
