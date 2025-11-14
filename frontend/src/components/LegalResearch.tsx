"use client"

import { useState } from 'react'

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

export default function LegalResearch() {
  const [queryText, setQueryText] = useState('')
  const [queryType, setQueryType] = useState('case_law')
  const [jurisdiction, setJurisdiction] = useState('US')
  const [results, setResults] = useState<ResearchResult[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'citations'>('search')
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null)

  const handleSearch = async () => {
    if (!queryText.trim()) return

    setLoading(true)
    try {
      // Create query
      const createRes = await fetch('/api/v1/research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        },
        body: JSON.stringify({
          query_text: queryText,
          query_type: queryType,
          jurisdiction: jurisdiction,
          filters: {}
        })
      })

      const query = await createRes.json()

      // Execute research
      const executeRes = await fetch(`/api/v1/research/${query.query_id}/execute?max_results=10`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })

      const data = await executeRes.json()
      setResults(data.results)
    } catch (error) {
      console.error('Research failed:', error)
      alert('Research failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveResult = async (resultId: string) => {
    try {
      await fetch(`/api/v1/research/results/${resultId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
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
      const res = await fetch('/api/v1/research/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
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
      alert('Citation saved!')
    } catch (error) {
      console.error('Failed to create citation:', error)
    }
  }

  const loadCitations = async () => {
    try {
      const res = await fetch('/api/v1/research/citations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })
      const data = await res.json()
      setCitations(data)
    } catch (error) {
      console.error('Failed to load citations:', error)
    }
  }

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Legal Research Assistant</h2>
        <p className="mt-1 text-sm text-gray-600">
          AI-powered case law, statute, and regulation search
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => {
              setActiveTab('citations')
              loadCitations()
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'citations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Citations ({citations.length})
          </button>
        </nav>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Enter your legal research query (e.g., 'contract breach remedies', 'employment discrimination cases', 'data privacy statutes')"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="case_law">Case Law</option>
                  <option value="statute">Statute</option>
                  <option value="regulation">Regulation</option>
                  <option value="treaty">Treaty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !queryText.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search Legal Database'}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Research Results ({results.length})
                </h3>
              </div>

              {results.map((result) => (
                <div key={result.result_id} className="bg-white shadow rounded-lg p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{result.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{result.citation}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {result.document_type}
                        </span>
                        <span className="text-xs text-gray-500">{result.court}</span>
                        <span className="text-xs text-gray-500">{result.date_decided}</span>
                        <span className={`text-xs font-medium ${getSeverityColor(result.relevance_score)}`}>
                          Relevance: {result.relevance_score}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveResult(result.result_id)}
                        disabled={result.is_saved}
                        className={`text-sm px-3 py-1 rounded ${
                          result.is_saved
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {result.is_saved ? 'Saved' : 'Save'}
                      </button>
                      <button
                        onClick={() => handleCreateCitation(result)}
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        Cite
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-sm text-gray-700">{result.summary}</p>
                  </div>

                  {/* Key Points */}
                  {result.key_points.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Key Points:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {result.key_points.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {result.ai_summary && (
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="text-sm font-semibold text-blue-900 mb-1">AI Analysis:</h5>
                      <p className="text-sm text-blue-800">{result.ai_summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Citations Tab */}
      {activeTab === 'citations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Saved Citations ({citations.length})
            </h3>
          </div>

          {citations.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No citations saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citations.map((citation) => (
                <div key={citation.citation_id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{citation.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{citation.citation_text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {citation.document_type}
                        </span>
                        {citation.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
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
  )
}
