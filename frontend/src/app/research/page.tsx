"use client"

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'

interface ResearchResult {
  result_id: string
  title: string
  citation: string
  document_type: string
  jurisdiction: string
  court?: string
  date_decided?: string
  summary: string
  key_points: string[]
  relevance_score: number
  ai_summary?: string
  precedent_value?: string
  is_saved: boolean
  notes?: string
}

interface Citation {
  citation_id: string
  citation_text: string
  document_type: string
  title: string
  tags: string[]
  folder?: string
  notes?: string
}

export default function ResearchPage() {
  const [queryText, setQueryText] = useState('')
  const [queryType, setQueryType] = useState('case_law')
  const [jurisdiction, setJurisdiction] = useState('Kenya')
  const [results, setResults] = useState<ResearchResult[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'citations'>('search')
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null)

  const handleSearch = async () => {
    if (!queryText.trim()) return

    setLoading(true)
    try {
      const createRes = await fetch('http://localhost:8000/api/v1/research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          query_text: queryText,
          query_type: queryType,
          jurisdiction: jurisdiction,
          filters: {}
        })
      })

      const query = await createRes.json()

      const executeRes = await fetch(`http://localhost:8000/api/v1/research/${query.query_id}/execute?max_results=10`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer demo-key'
        }
      })

      const data = await executeRes.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Research failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResult = async (resultId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/research/results/${resultId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({ is_saved: true })
      })

      setResults(results.map(r =>
        r.result_id === resultId ? { ...r, is_saved: true } : r
      ))
    } catch (error) {
      console.error('Failed to save result:', error)
    }
  }

  const handleCreateCitation = async (result: ResearchResult) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/research/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          result_id: result.result_id,
          citation_text: result.citation,
          document_type: result.document_type,
          title: result.title,
          tags: [],
          notes: ''
        })
      })

      const citation = await res.json()
      setCitations([citation, ...citations])
    } catch (error) {
      console.error('Failed to create citation:', error)
    }
  }

  const loadCitations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/research/citations', {
        headers: {
          'Authorization': 'Bearer demo-key'
        }
      })
      const data = await res.json()
      setCitations(data || [])
    } catch (error) {
      console.error('Failed to load citations:', error)
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'case_law': '⚖️',
      'statute': '📜',
      'regulation': '📋',
      'treaty': '🤝'
    }
    return icons[type] || '📄'
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
              🔍 Legal Research
            </h1>
            <p className="text-gray-600 text-lg">AI-powered case law, statute, and regulation search</p>
          </div>

          {/* Tab Navigation */}
          <div className="glass rounded-2xl p-2 mb-8 inline-flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'search'
                  ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              🔍 Search
            </button>
            <button
              onClick={() => {
                setActiveTab('citations')
                loadCitations()
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'citations'
                  ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              📚 Citations ({citations.length})
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="glass rounded-3xl p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Search Query
                  </label>
                  <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Enter your legal research query (e.g., 'contract breach remedies', 'employment discrimination cases', 'data privacy statutes')"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Document Type
                    </label>
                    <select
                      value={queryType}
                      onChange={(e) => setQueryType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                    >
                      <option value="case_law">⚖️ Case Law</option>
                      <option value="statute">📜 Statute</option>
                      <option value="regulation">📋 Regulation</option>
                      <option value="treaty">🤝 Treaty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Jurisdiction
                    </label>
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                    >
                      <option value="Kenya">🇰🇪 Kenya</option>
                      <option value="US">🇺🇸 United States</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading || !queryText.trim()}
                  className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching Legal Database...
                    </span>
                  ) : (
                    '🔍 Search Legal Database'
                  )}
                </button>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Research Results ({results.length})
                    </h3>
                  </div>

                  {results.map((result) => (
                    <div key={result.result_id} className="glass rounded-3xl p-8 hover:shadow-2xl transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{getDocumentIcon(result.document_type)}</span>
                            <h4 className="text-xl font-bold text-[#3D2F28]">{result.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 font-mono mb-3">{result.citation}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                              {result.document_type.replace('_', ' ').toUpperCase()}
                            </span>
                            {result.court && (
                              <span className="text-xs text-gray-600 font-semibold">
                                🏛️ {result.court}
                              </span>
                            )}
                            {result.date_decided && (
                              <span className="text-xs text-gray-600 font-semibold">
                                📅 {result.date_decided}
                              </span>
                            )}
                            <span className={`text-xs font-bold ${getRelevanceColor(result.relevance_score)}`}>
                              ⭐ Relevance: {result.relevance_score}/10
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveResult(result.result_id)}
                            disabled={result.is_saved}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                              result.is_saved
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'btn-3d bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105'
                            }`}
                          >
                            {result.is_saved ? '✓ Saved' : '💾 Save'}
                          </button>
                          <button
                            onClick={() => handleCreateCitation(result)}
                            className="btn-3d bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:scale-105 transition-all"
                          >
                            📝 Cite
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                      </div>

                      {/* Key Points */}
                      {result.key_points && result.key_points.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-bold text-gray-900 mb-3">Key Points:</h5>
                          <ul className="space-y-2">
                            {result.key_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#526450] font-bold mt-0.5">•</span>
                                <span className="text-sm text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Analysis */}
                      {result.ai_summary && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200">
                          <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <span>🤖</span> AI Analysis
                          </h5>
                          <p className="text-sm text-blue-800 leading-relaxed">{result.ai_summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && results.length === 0 && queryText && (
                <div className="glass rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try adjusting your search query or filters</p>
                </div>
              )}
            </div>
          )}

          {/* Citations Tab */}
          {activeTab === 'citations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Saved Citations ({citations.length})
                </h3>
              </div>

              {citations.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Citations Saved</h3>
                  <p className="text-gray-600">Citations you save from search results will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {citations.map((citation) => (
                    <div key={citation.citation_id} className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-[#3D2F28] mb-2">{citation.title}</p>
                          <p className="text-sm text-gray-600 font-mono mb-3">{citation.citation_text}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full font-semibold">
                              {citation.document_type}
                            </span>
                            {citation.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
