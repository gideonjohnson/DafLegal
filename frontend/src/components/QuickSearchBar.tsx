'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: 'feature' | 'document' | 'page' | 'action'
  title: string
  description: string
  href: string
  icon: string
  category?: string
  badge?: string
}

// All searchable features and pages
const searchableItems: SearchResult[] = [
  // Features - Analysis
  {
    id: 'analyze',
    type: 'feature',
    title: 'Contract Analysis',
    description: 'AI-powered document analysis and risk detection',
    href: '/analyze',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    category: 'Analysis',
    badge: 'Popular'
  },
  {
    id: 'compare',
    type: 'feature',
    title: 'Document Comparison',
    description: 'Compare contracts and track changes',
    href: '/compare',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    category: 'Analysis'
  },
  {
    id: 'summarize',
    type: 'feature',
    title: 'Quick Summary',
    description: 'Get instant contract summaries',
    href: '/summarize',
    icon: 'M4 6h16M4 12h16M4 18h7',
    category: 'Analysis'
  },
  // Features - Compliance
  {
    id: 'compliance',
    type: 'feature',
    title: 'Compliance Check',
    description: 'Verify regulatory compliance',
    href: '/compliance',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    category: 'Compliance',
    badge: 'Popular'
  },
  // Features - Drafting
  {
    id: 'drafting',
    type: 'feature',
    title: 'Contract Drafting',
    description: 'Generate custom contracts with AI',
    href: '/drafting',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    category: 'Drafting',
    badge: 'Popular'
  },
  {
    id: 'templates',
    type: 'feature',
    title: 'Template Library',
    description: 'Access pre-built contract templates',
    href: '/templates',
    icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    category: 'Drafting'
  },
  // Features - Research
  {
    id: 'research',
    type: 'feature',
    title: 'Legal Research',
    description: 'Search case law and precedents',
    href: '/research',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    category: 'Research'
  },
  {
    id: 'translation',
    type: 'feature',
    title: 'Legal Translation',
    description: 'Translate documents accurately',
    href: '/translation',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
    category: 'Research'
  },
  // Pages
  {
    id: 'dashboard',
    type: 'page',
    title: 'Dashboard',
    description: 'View your dashboard and recent activity',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'pricing',
    type: 'page',
    title: 'Pricing',
    description: 'View plans and pricing',
    href: '/pricing',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'settings',
    type: 'page',
    title: 'Settings',
    description: 'Manage your account settings',
    href: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  },
  // Quick Actions
  {
    id: 'upload',
    type: 'action',
    title: 'Upload Document',
    description: 'Upload a new document for analysis',
    href: '/analyze?upload=true',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
  },
  {
    id: 'new-draft',
    type: 'action',
    title: 'New Draft',
    description: 'Start drafting a new contract',
    href: '/drafting?new=true',
    icon: 'M12 4v16m8-8H4'
  }
]

export function QuickSearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fuzzy search function
  const fuzzySearch = useCallback((searchQuery: string, items: SearchResult[]): SearchResult[] => {
    if (!searchQuery.trim()) return []

    const lowerQuery = searchQuery.toLowerCase()
    const words = lowerQuery.split(' ').filter(w => w.length > 0)

    return items
      .map(item => {
        const titleLower = item.title.toLowerCase()
        const descLower = item.description.toLowerCase()
        const categoryLower = (item.category || '').toLowerCase()

        let score = 0

        // Exact match bonus
        if (titleLower === lowerQuery) score += 100
        if (titleLower.includes(lowerQuery)) score += 50
        if (descLower.includes(lowerQuery)) score += 20
        if (categoryLower.includes(lowerQuery)) score += 10

        // Word match scoring
        words.forEach(word => {
          if (titleLower.includes(word)) score += 30
          if (descLower.includes(word)) score += 10
          if (categoryLower.includes(word)) score += 5
        })

        // Fuzzy character matching
        let titleIndex = 0
        let matchCount = 0
        for (const char of lowerQuery) {
          const foundIndex = titleLower.indexOf(char, titleIndex)
          if (foundIndex !== -1) {
            matchCount++
            titleIndex = foundIndex + 1
          }
        }
        if (matchCount > 0) {
          score += (matchCount / lowerQuery.length) * 20
        }

        // Popular items get small boost
        if (item.badge === 'Popular') score += 5

        return { ...item, score }
      })
      .filter(item => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [])

  // Handle search
  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuzzySearch(query, searchableItems)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
      setSelectedIndex(0)
    }
  }, [query, fuzzySearch])

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [result.title, ...prev.filter(s => s !== result.title)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      return updated
    })

    // Navigate
    router.push(result.href)
    setIsOpen(false)
    setQuery('')
  }

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'document':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'page':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'action':
        return 'bg-[#d4a561]/20 text-[#d4a561]'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-[#2d5a2d]/50 border border-[#d4a561]/20 hover:border-[#d4a561]/50 transition-all duration-200 group"
      >
        <svg className="w-4 h-4 text-[#8b7355] dark:text-[#d4c5b0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">Quick search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#8b7355] dark:text-[#d4c5b0] bg-white/50 dark:bg-[#1a2e1a]/50 border border-[#d4a561]/20 rounded">
          <span>⌘</span>K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a2e1a]/80 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-20 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 animate-fade-in-up">
        <div className="bg-white/95 dark:bg-[#2d5a2d]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#d4a561]/20 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[#d4a561]/20">
            <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search features, documents, pages..."
              className="flex-1 bg-transparent text-[#1a2e1a] dark:text-[#f5edd8] placeholder-[#8b7355] dark:placeholder-[#d4c5b0] outline-none text-base"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-[#8b7355] dark:text-[#d4c5b0] bg-[#d4a561]/10 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() === '' ? (
              // Recent searches or suggestions
              <div className="p-4">
                {recentSearches.length > 0 ? (
                  <>
                    <h3 className="text-xs font-bold text-[#8b7355] dark:text-[#d4c5b0] uppercase tracking-wider mb-3">
                      Recent Searches
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#d4a561]/10 transition-colors flex items-center gap-2 text-sm text-[#1a2e1a] dark:text-[#f5edd8]"
                        >
                          <svg className="w-4 h-4 text-[#8b7355] dark:text-[#d4c5b0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-1">
                      Start typing to search
                    </p>
                    <p className="text-xs text-[#8b7355]/70 dark:text-[#d4c5b0]/70">
                      Search features, documents, and pages
                    </p>
                  </div>
                )}
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`
                      w-full text-left px-3 py-3 rounded-lg transition-all duration-200
                      flex items-start gap-3 group
                      ${index === selectedIndex
                        ? 'bg-[#d4a561]/20 scale-[1.02]'
                        : 'hover:bg-[#d4a561]/10'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-lg
                      ${index === selectedIndex ? 'bg-[#d4a561] scale-110' : 'bg-[#d4a561]/20'}
                      flex items-center justify-center transition-all duration-200
                    `}>
                      <svg
                        className={`w-5 h-5 ${index === selectedIndex ? 'text-white' : 'text-[#d4a561]'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={result.icon} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-[#1a2e1a] dark:text-[#f5edd8] group-hover:text-[#d4a561] transition-colors truncate">
                          {result.title}
                        </h4>
                        {result.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d4a561]/20 text-[#d4a561]">
                            {result.badge}
                          </span>
                        )}
                        <span className={`ml-auto flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ${getTypeBadge(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] line-clamp-1">
                        {result.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    {index === selectedIndex && (
                      <svg className="flex-shrink-0 w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
                  No results found for &quot;{query}&quot;
                </p>
                <p className="text-xs text-[#8b7355]/70 dark:text-[#d4c5b0]/70 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#d4a561]/20 bg-[#d4a561]/5">
            <div className="flex items-center justify-between text-xs text-[#8b7355] dark:text-[#d4c5b0]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/50 dark:bg-[#1a2e1a]/50 border border-[#d4a561]/20 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/50 dark:bg-[#1a2e1a]/50 border border-[#d4a561]/20 rounded">↓</kbd>
                  <span className="ml-1">navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/50 dark:bg-[#1a2e1a]/50 border border-[#d4a561]/20 rounded">↵</kbd>
                  <span className="ml-1">select</span>
                </span>
              </div>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
