'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  showQuickResults?: boolean
  onQuickResultClick?: (result: any) => void
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  showQuickResults = false,
  onQuickResultClick,
  className = ''
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [quickResults, setQuickResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedValue = useDebounce(value, 300)

  // Fetch quick results when typing (if enabled)
  useEffect(() => {
    if (showQuickResults && debouncedValue && debouncedValue.length >= 2) {
      fetchQuickResults(debouncedValue)
    } else {
      setQuickResults(null)
    }
  }, [debouncedValue, showQuickResults])

  const fetchQuickResults = async (query: string) => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const apiKey = localStorage.getItem('apiKey')

      const response = await fetch(
        `${apiUrl}/api/v1/search/quick?q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setQuickResults(data)
      }
    } catch (error) {
      console.error('Quick search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(value)
    setQuickResults(null)
  }

  const handleResultClick = (result: any) => {
    onQuickResultClick?.(result)
    setQuickResults(null)
    setFocused(false)
  }

  const showDropdown = focused && quickResults && (
    quickResults.contracts?.length > 0 || quickResults.clauses?.length > 0
  )

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#d4a561] focus:outline-none focus:ring-2 focus:ring-[#d4a561]/20 transition-all"
        />

        {/* Loading/Clear button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : value && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setQuickResults(null)
                inputRef.current?.focus()
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Quick results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {/* Contracts */}
          {quickResults.contracts?.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contracts
              </div>
              {quickResults.contracts.map((contract: any) => (
                <button
                  key={contract.id}
                  onClick={() => handleResultClick(contract)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{contract.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ml-2 ${
                      contract.risk_level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      contract.risk_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      contract.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {contract.risk_level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Clauses */}
          {quickResults.clauses?.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clauses
              </div>
              {quickResults.clauses.map((clause: any) => (
                <button
                  key={clause.id}
                  onClick={() => handleResultClick(clause)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{clause.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{clause.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {quickResults.contracts?.length === 0 && quickResults.clauses?.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
