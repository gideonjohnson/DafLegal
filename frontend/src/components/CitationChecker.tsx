"use client"

import { useState, useEffect } from 'react'

interface CitationIssue {
  issue_id: string
  citation_text: string
  citation_type: string
  location_start: number
  location_end: number
  severity: string
  issue_type: string
  issue_description: string
  expected_format?: string
  actual_format?: string
  suggested_fix?: string
  is_verified: boolean
  verification_status?: string
  surrounding_text?: string
}

interface CitationCheckResult {
  check_id: string
  document_name: string
  citation_format: string
  status: string
  total_citations_found: number
  valid_citations: number
  invalid_citations: number
  warnings: number
  overall_score: number
  processing_time_seconds?: number
  created_at: string
  issues?: CitationIssue[]
}

interface CitationFormat {
  format_id: string
  name: string
  citation_type: string
  example: string
  description: string
}

export default function CitationChecker() {
  const [documentText, setDocumentText] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [citationFormat, setCitationFormat] = useState('bluebook')
  const [checkResult, setCheckResult] = useState<CitationCheckResult | null>(null)
  const [availableFormats, setAvailableFormats] = useState<CitationFormat[]>([])
  const [checkHistory, setCheckHistory] = useState<CitationCheckResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check')

  useEffect(() => {
    loadFormats()
    loadHistory()
  }, [])

  const loadFormats = async () => {
    try {
      const res = await fetch('/api/v1/citations/formats/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })
      if (res.ok) {
        const formats = await res.json()
        setAvailableFormats(formats)
      }
    } catch (error) {
      console.error('Failed to load formats:', error)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/v1/citations/checks/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })
      if (res.ok) {
        const history = await res.json()
        setCheckHistory(history)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleCheck = async () => {
    if (!documentText.trim() || !documentName.trim()) {
      alert('Please provide both document text and name')
      return
    }

    setLoading(true)
    setCheckResult(null)
    try {
      const res = await fetch('/api/v1/citations/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        },
        body: JSON.stringify({
          document_text: documentText,
          document_name: documentName,
          citation_format: citationFormat
        })
      })

      if (!res.ok) throw new Error('Check failed')

      const checkData = await res.json()

      const detailRes = await fetch(`/api/v1/citations/${checkData.check_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })

      const detailData = await detailRes.json()
      setCheckResult(detailData)
      loadHistory()
    } catch (error) {
      console.error('Citation check failed:', error)
      alert('Citation check failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadCheckDetail = async (checkId: string) => {
    try {
      const res = await fetch(`/api/v1/citations/${checkId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setCheckResult(data)
        setActiveTab('check')
      }
    } catch (error) {
      console.error('Failed to load check:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300',
      high: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-300',
      medium: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 border-yellow-300',
      low: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300',
      info: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300'
    }
    return colors[severity as keyof typeof colors] || colors.info
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const uniqueFormats = [...new Set(availableFormats.map(f => f.name))]

  return (
    <div className="max-w-7xl mx-auto p-6 slide-in-bottom">
      {/* Header with gradient */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold gradient-text mb-3">Citation Checker</h1>
        <p className="text-gray-600 text-lg">Validate legal citations against Bluebook, ALWD, and other formats with AI precision</p>
      </div>

      {/* Tabs with 3D effect */}
      <div className="card-3d mb-8 p-2">
        <nav className="flex space-x-2">
          <TabButton
            active={activeTab === 'check'}
            onClick={() => setActiveTab('check')}
            icon="🔍"
            label="Check Citations"
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon="📜"
            label={`History (${checkHistory.length})`}
          />
        </nav>
      </div>

      {/* Check Citations Tab */}
      {activeTab === 'check' && (
        <div className="space-y-6 fade-in-scale">
          {/* Input Form */}
          <div className="card-3d p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="icon-3d w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-xl">
                📄
              </span>
              Document Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g., Motion for Summary Judgment"
                  className="input-3d"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Citation Format
                </label>
                <select
                  value={citationFormat}
                  onChange={(e) => setCitationFormat(e.target.value)}
                  className="input-3d"
                >
                  {uniqueFormats.length > 0 ? (
                    uniqueFormats.map(format => (
                      <option key={format} value={format.toLowerCase()}>{format}</option>
                    ))
                  ) : (
                    <>
                      <option value="bluebook">Bluebook</option>
                      <option value="alwd">ALWD</option>
                      <option value="chicago">Chicago Manual of Style</option>
                      <option value="apa">APA</option>
                      <option value="mla">MLA</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Document Text *
                </label>
                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Paste your legal document text here. Include all citations you want to verify..."
                  rows={14}
                  className="input-3d font-mono text-sm custom-scrollbar resize-none"
                />
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <span className="badge-3d bg-indigo-100 text-indigo-700">
                    {documentText.length} characters
                  </span>
                </p>
              </div>

              <button
                onClick={handleCheck}
                disabled={loading || !documentText.trim() || !documentName.trim()}
                className="btn-3d w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="spinner-3d w-6 h-6"></div>
                    Analyzing Citations...
                  </span>
                ) : (
                  <span className="relative z-10">🔍 Check Citations</span>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {checkResult && (
            <div className="space-y-6 slide-in-bottom">
              {/* Summary Card with 3D stats */}
              <div className="card-3d p-8 bg-gradient-to-br from-white to-indigo-50/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Check Results</h2>
                  <div className="text-center">
                    <div className={`text-5xl font-black ${getScoreColor(checkResult.overall_score)}`}>
                      {checkResult.overall_score.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">Accuracy Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    icon="📊"
                    value={checkResult.total_citations_found}
                    label="Total Citations"
                    gradient="from-gray-500 to-gray-600"
                  />
                  <StatCard
                    icon="✅"
                    value={checkResult.valid_citations}
                    label="Valid"
                    gradient="from-green-500 to-green-600"
                  />
                  <StatCard
                    icon="❌"
                    value={checkResult.invalid_citations}
                    label="Invalid"
                    gradient="from-red-500 to-red-600"
                  />
                  <StatCard
                    icon="⚠️"
                    value={checkResult.warnings}
                    label="Warnings"
                    gradient="from-yellow-500 to-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 p-4 bg-white/50 rounded-xl">
                  <span className="flex items-center gap-2">
                    <span className="badge-3d bg-indigo-100 text-indigo-700 font-bold capitalize">{checkResult.citation_format}</span>
                    format
                  </span>
                  {checkResult.processing_time_seconds && (
                    <span className="badge-3d bg-green-100 text-green-700 font-bold">
                      ⚡ {checkResult.processing_time_seconds.toFixed(2)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Issues List */}
              {checkResult.issues && checkResult.issues.length > 0 && (
                <div className="card-3d p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="icon-3d w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-xl flex items-center justify-center text-xl">
                      ⚠️
                    </span>
                    Issues Found ({checkResult.issues.length})
                  </h3>

                  <div className="space-y-4">
                    {checkResult.issues.map((issue, index) => (
                      <div
                        key={issue.issue_id}
                        className={`card-3d border-l-4 p-6 ${getSeverityColor(issue.severity)} border-opacity-50`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`badge-3d uppercase text-xs font-black px-3 py-1.5 rounded-lg ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="text-sm text-gray-600 capitalize font-semibold">
                              {issue.citation_type} • {issue.issue_type.replace('_', ' ')}
                            </span>
                          </div>
                          {issue.is_verified && (
                            <span className="badge-3d bg-green-500 text-white text-xs font-bold px-3 py-1">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <p className="font-mono text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl shadow-inner">
                            {issue.citation_text}
                          </p>
                        </div>

                        <p className="text-gray-700 font-medium mb-3">{issue.issue_description}</p>

                        {issue.suggested_fix && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                              <span className="text-lg">💡</span>
                              Suggested Fix:
                            </p>
                            <p className="font-mono text-sm bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 px-4 py-3 rounded-xl border-2 border-green-200">
                              {issue.suggested_fix}
                            </p>
                          </div>
                        )}

                        {issue.surrounding_text && (
                          <details className="mt-4 pt-4 border-t border-gray-200">
                            <summary className="text-sm font-bold text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors">
                              📍 View Context
                            </summary>
                            <p className="mt-3 text-sm italic bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                              {issue.surrounding_text}
                            </p>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {checkResult.issues && checkResult.issues.length === 0 && (
                <div className="card-3d bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-200 p-10 text-center">
                  <div className="text-7xl mb-4 animate-bounce">✅</div>
                  <h3 className="text-3xl font-bold text-green-900 mb-3">
                    All Citations Valid!
                  </h3>
                  <p className="text-green-700 text-lg">
                    No issues found. All {checkResult.total_citations_found} citations are properly formatted.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card-3d p-8 fade-in-scale">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="icon-3d w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center text-xl">
              📜
            </span>
            Check History
          </h2>

          {checkHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-50">📋</div>
              <p className="text-gray-500 text-lg mb-6">No citation checks yet</p>
              <button
                onClick={() => setActiveTab('check')}
                className="btn-3d bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold"
              >
                Check your first document →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {checkHistory.map((check, index) => (
                <div
                  key={check.check_id}
                  onClick={() => loadCheckDetail(check.check_id)}
                  className="card-3d p-6 cursor-pointer hover:scale-102 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{check.document_name}</h3>
                    <span className={`text-3xl font-black ${getScoreColor(check.overall_score)}`}>
                      {check.overall_score.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="badge-3d bg-indigo-100 text-indigo-700 font-bold capitalize">
                      {check.citation_format}
                    </span>
                    <span className="text-gray-500">{new Date(check.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="badge-3d bg-gray-100 text-gray-700">
                      📊 {check.total_citations_found} citations
                    </span>
                    <span className="badge-3d bg-green-100 text-green-700">
                      ✅ {check.valid_citations}
                    </span>
                    {check.invalid_citations > 0 && (
                      <span className="badge-3d bg-red-100 text-red-700">
                        ❌ {check.invalid_citations}
                      </span>
                    )}
                    {check.warnings > 0 && (
                      <span className="badge-3d bg-yellow-100 text-yellow-700">
                        ⚠️ {check.warnings}
                      </span>
                    )}
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

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  )
}

// Stat Card Component
function StatCard({ icon, value, label, gradient }: { icon: string; value: number; label: string; gradient: string }) {
  return (
    <div className="stat-card text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-semibold">{label}</div>
    </div>
  )
}
