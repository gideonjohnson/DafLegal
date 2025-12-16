'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAskBar } from '@/hooks/useAskBar'

interface Clause {
  clause_id: string
  title: string
  category: string
  text: string
  description?: string
  alternate_text?: string
  tags: string[]
  jurisdiction?: string
  language: string
  risk_level: string
  compliance_notes?: string
  status: string
  version: number
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export default function ClausesPage() {
  const [clauses, setClauses] = useState<Clause[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { triggerAsk } = useAskBar()

  // Search filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  // New clause form
  const [newClause, setNewClause] = useState({
    title: '',
    category: 'termination',
    text: '',
    description: '',
    tags: [] as string[],
    risk_level: 'neutral'
  })

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const searchClauses = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/clauses/search`,
        {
          query: searchQuery || undefined,
          category: categoryFilter || undefined,
          tags: tagFilter ? [tagFilter] : undefined,
          limit: 50,
          offset: 0
        },
        { headers: { Authorization: `Bearer demo-key` } }
      )

      setClauses(response.data.clauses)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search clauses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchClauses()
  }, [categoryFilter])

  const handleCreateClause = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/clauses/`,
        newClause,
        { headers: { Authorization: `Bearer demo-key` } }
      )

      setClauses([response.data, ...clauses])
      setShowCreateModal(false)
      setNewClause({
        title: '',
        category: 'termination',
        text: '',
        description: '',
        tags: [],
        risk_level: 'neutral'
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create clause')
    }
  }

  const handleCopyClause = (clause: Clause) => {
    navigator.clipboard.writeText(clause.text)
    setCopiedId(clause.clause_id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'favorable': return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      case 'neutral': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      case 'moderate': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      case 'unfavorable': return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  const categories = [
    { value: 'termination', label: 'Termination', icon: '⚠️' },
    { value: 'indemnification', label: 'Indemnification', icon: '🛡️' },
    { value: 'liability', label: 'Liability', icon: '⚖️' },
    { value: 'intellectual_property', label: 'IP Rights', icon: '💡' },
    { value: 'confidentiality', label: 'Confidentiality', icon: '🔒' },
    { value: 'payment', label: 'Payment', icon: '💰' },
    { value: 'renewal', label: 'Renewal', icon: '🔄' },
    { value: 'force_majeure', label: 'Force Majeure', icon: '🌪️' },
    { value: 'dispute_resolution', label: 'Dispute Resolution', icon: '⚡' }
  ]

  return (
    <div className="min-h-screen leather-bg relative overflow-hidden">
      {/* Background Image with Green Blend */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/webimg2.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e1a]/70 via-[#234023]/65 to-[#2d5a2d]/70"></div>
      </div>

      <div className="relative z-10">
      <main className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="icon-3d w-20 h-20 bg-gradient-to-br from-[#3D2F28] via-[#5C4A3D] to-[#526450] rounded-3xl flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-black mb-4">Clause Library</h1>
          <p className="text-xl text-gray-600">Your vault of pre-approved contract clauses</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass rounded-3xl p-6 shadow-xl mb-8">
          <div className="grid md:grid-cols-12 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-5">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search clauses by title, text, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchClauses()}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={searchClauses}
              disabled={loading}
              className="btn-3d bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </span>
              )}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-3d bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Clause
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass rounded-2xl p-4 border-2 border-red-200 bg-red-50 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Clause Cards */}
        <div className="grid gap-6">
          {clauses.length === 0 && !loading && (
            <div className="glass rounded-3xl p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No clauses found</h3>
              <p className="text-gray-600 mb-6">Create your first clause to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-3d bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create First Clause
              </button>
            </div>
          )}

          {clauses.map((clause) => {
            const category = categories.find(c => c.value === clause.category)
            const isExpanded = selectedClause?.clause_id === clause.clause_id

            return (
              <div
                key={clause.clause_id}
                className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{category?.icon || '📄'}</span>
                      <h3 className="text-xl font-bold text-black">{clause.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white text-xs font-bold rounded-full">
                        {category?.label || clause.category.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRiskBadgeStyle(clause.risk_level)}`}>
                        {clause.risk_level.toUpperCase()}
                      </span>
                      {clause.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          #{tag}
                        </span>
                      ))}
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        v{clause.version}
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                        Used {clause.usage_count}×
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyClause(clause)}
                      className={`btn-3d px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                        copiedId === clause.clause_id
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {copiedId === clause.clause_id ? (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedClause(isExpanded ? null : clause)}
                      className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
                    >
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {clause.description && (
                  <p className="text-gray-600 mb-3 leading-relaxed">{clause.description}</p>
                )}

                {isExpanded && (
                  <div className="mt-4 space-y-4 slide-in-bottom">
                    <div className="p-6 bg-white rounded-xl border-2 border-gray-100">
                      <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Clause Text</h4>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{clause.text}</p>
                    </div>

                    {clause.alternate_text && (
                      <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <h4 className="text-sm font-bold text-blue-700 uppercase mb-3">Alternative Version</h4>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{clause.alternate_text}</p>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-gray-500 pt-4 border-t-2 border-gray-100">
                      <span>Created {new Date(clause.created_at).toLocaleDateString()}</span>
                      {clause.last_used_at && (
                        <span>Last used {new Date(clause.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
            <div className="glass rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">Create New Clause</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newClause.title}
                    onChange={(e) => setNewClause({...newClause, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                    placeholder="e.g., Standard Termination Clause"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={newClause.category}
                      onChange={(e) => setNewClause({...newClause, category: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Risk Level</label>
                    <select
                      value={newClause.risk_level}
                      onChange={(e) => setNewClause({...newClause, risk_level: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                    >
                      <option value="favorable">✅ Favorable</option>
                      <option value="neutral">⚪ Neutral</option>
                      <option value="moderate">⚠️ Moderate</option>
                      <option value="unfavorable">❌ Unfavorable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Clause Text</label>
                  <textarea
                    value={newClause.text}
                    onChange={(e) => setNewClause({...newClause, text: e.target.value})}
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                    placeholder="Enter the full clause text here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={newClause.description}
                    onChange={(e) => setNewClause({...newClause, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#526450] focus:outline-none transition-colors"
                    placeholder="Brief description of when to use this clause..."
                  />
                </div>

                <button
                  onClick={handleCreateClause}
                  className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68] text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Create Clause
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </div>
      </div>
  )
}
