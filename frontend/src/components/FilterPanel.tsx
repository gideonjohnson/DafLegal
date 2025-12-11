'use client'

import { useState } from 'react'

export interface Filters {
  risk_level?: string[]
  date_from?: string
  date_to?: string
  status?: string[]
  min_risk_score?: number
  max_risk_score?: number
}

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
}

export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const riskLevels = ['low', 'medium', 'high', 'critical']
  const statuses = ['uploaded', 'processing', 'completed', 'failed']

  const toggleRiskLevel = (level: string) => {
    const current = filters.risk_level || []
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level]
    onChange({ ...filters, risk_level: updated })
  }

  const toggleStatus = (status: string) => {
    const current = filters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    onChange({ ...filters, status: updated })
  }

  const hasActiveFilters =
    (filters.risk_level && filters.risk_level.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.date_from ||
    filters.date_to ||
    filters.min_risk_score !== undefined ||
    filters.max_risk_score !== undefined

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#d4a561] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a561] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4a561]"></span>
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-20 max-h-[600px] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClear()
                    setIsOpen(false)
                  }}
                  className="text-sm text-[#d4a561] hover:text-[#b8965a] font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Risk Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Level
              </label>
              <div className="space-y-2">
                {riskLevels.map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.risk_level?.includes(level) || false}
                      onChange={() => toggleRiskLevel(level)}
                      className="w-4 h-4 text-[#d4a561] border-gray-300 rounded focus:ring-[#d4a561]"
                    />
                    <span className={`text-sm capitalize ${
                      level === 'critical' ? 'text-red-600 dark:text-red-400 font-medium' :
                      level === 'high' ? 'text-orange-600 dark:text-orange-400' :
                      level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-[#d4a561] focus:border-[#d4a561]"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-[#d4a561] focus:border-[#d4a561]"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Risk Score Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Score (0-100)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.min_risk_score || ''}
                  onChange={(e) => onChange({ ...filters, min_risk_score: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-[#d4a561] focus:border-[#d4a561]"
                  placeholder="Min"
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.max_risk_score || ''}
                  onChange={(e) => onChange({ ...filters, max_risk_score: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-[#d4a561] focus:border-[#d4a561]"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statuses.map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={() => toggleStatus(status)}
                      className="w-4 h-4 text-[#d4a561] border-gray-300 rounded focus:ring-[#d4a561]"
                    />
                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-[#d4a561] text-white rounded-lg font-medium hover:bg-[#b8965a] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  )
}
