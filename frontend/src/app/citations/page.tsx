"use client"
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'

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

export default function CitationsPage() {
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
      const res = await fetch('http://localhost:8000/api/v1/citations/formats/list', {
        headers: {
          'Authorization': 'Bearer demo-key'
        }
      })
      if (res.ok) {
        const formats = await res.json()
        setAvailableFormats(formats || [])
      }
    } catch (error) {
      console.error('Failed to load formats:', error)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/citations/checks/history?limit=20', {
        headers: {
          'Authorization': 'Bearer demo-key'
        }
      })
      if (res.ok) {
        const history = await res.json()
        setCheckHistory(history || [])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleCheck = async () => {
    if (!documentText.trim() || !documentName.trim()) {
      return
    }

    setLoading(true)
    setCheckResult(null)
    try {
      const res = await fetch('http://localhost:8000/api/v1/citations/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key'
        },
        body: JSON.stringify({
          document_text: documentText,
          document_name: documentName,
          citation_format: citationFormat
        })
      })

      if (!res.ok) throw new Error('Check failed')

      const checkData = await res.json()

      const detailRes = await fetch(`http://localhost:8000/api/v1/citations/${checkData.check_id}`, {
        headers: {
          'Authorization': 'Bearer demo-key'
        }
      })

      const detailData = await detailRes.json()
      setCheckResult(detailData)
      loadHistory()
    } catch (error) {
      console.error('Citation check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCheckDetail = async (checkId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/citations/${checkId}`, {
        headers: {
          'Authorization': 'Bearer demo-key'
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
      critical: 'from-red-500 to-red-600 border-red-300',
      high: 'from-orange-500 to-orange-600 border-orange-300',
      medium: 'from-yellow-400 to-yellow-500 border-yellow-300',
      low: 'from-blue-400 to-blue-500 border-blue-300',
      info: 'from-gray-400 to-gray-500 border-gray-300'
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
        <Navigation />
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
              📝 Citation Checker
            </h1>
            <p className="text-gray-600 text-lg">Validate legal citations against Bluebook, ALWD, and other formats with AI precision</p>
          </div>

          {/* Tab Navigation */}
          <div className="glass rounded-2xl p-2 mb-8 inline-flex">
            <button
              onClick={() => setActiveTab('check')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'check'
                  ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              🔍 Check Citations
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'history'
                  ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              📜 History ({checkHistory.length})
            </button>
          </div>

          {/* Check Citations Tab */}
          {activeTab === 'check' && (
            <div className="space-y-6">
              {/* Input Form */}
              <div className="glass rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  Document Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., Motion for Summary Judgment"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Citation Format
                  </label>
                  <select
                    value={citationFormat}
                    onChange={(e) => setCitationFormat(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  >
                    {uniqueFormats.length > 0 ? (
                      uniqueFormats.map(format => (
                        <option key={format} value={format.toLowerCase()}>{format}</option>
                      ))
                    ) : (
                      <>
                        <option value="bluebook">📘 Bluebook</option>
                        <option value="alwd">📕 ALWD</option>
                        <option value="chicago">📙 Chicago Manual of Style</option>
                        <option value="apa">📗 APA</option>
                        <option value="mla">📔 MLA</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document Text *
                  </label>
                  <textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Paste your legal document text here. Include all citations you want to verify..."
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all font-mono text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {documentText.length} characters
                  </p>
                </div>

                <button
                  onClick={handleCheck}
                  disabled={loading || !documentText.trim() || !documentName.trim()}
                  className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Citations...
                    </span>
                  ) : (
                    '🔍 Check Citations'
                  )}
                </button>
              </div>

              {/* Results */}
              {checkResult && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="glass rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#3D2F28]">Check Results</h2>
                      <div className="text-center">
                        <div className={`text-5xl font-black ${getScoreColor(checkResult.overall_score)}`}>
                          {checkResult.overall_score.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 font-semibold mt-1">Accuracy Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="glass rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">📊</div>
                        <div className="text-3xl font-black text-gray-700">
                          {checkResult.total_citations_found}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">Total Citations</div>
                      </div>
                      <div className="glass rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-3xl font-black text-green-600">
                          {checkResult.valid_citations}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">Valid</div>
                      </div>
                      <div className="glass rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">❌</div>
                        <div className="text-3xl font-black text-red-600">
                          {checkResult.invalid_citations}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">Invalid</div>
                      </div>
                      <div className="glass rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">⚠️</div>
                        <div className="text-3xl font-black text-yellow-600">
                          {checkResult.warnings}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">Warnings</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 p-4 glass rounded-xl">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white rounded-full text-xs font-bold capitalize">
                          {checkResult.citation_format}
                        </span>
                        format
                      </span>
                      {checkResult.processing_time_seconds && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-xs font-bold">
                          ⚡ {checkResult.processing_time_seconds.toFixed(2)}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issues List */}
                  {checkResult.issues && checkResult.issues.length > 0 && (
                    <div className="glass rounded-3xl p-8">
                      <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        Issues Found ({checkResult.issues.length})
                      </h3>

                      <div className="space-y-4">
                        {checkResult.issues.map((issue) => (
                          <div key={issue.issue_id} className="glass rounded-2xl p-6 border-l-4 border-red-400">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-white bg-gradient-to-r ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                                <span className="text-sm text-gray-600 capitalize font-semibold">
                                  {issue.citation_type} • {issue.issue_type.replace('_', ' ')}
                                </span>
                              </div>
                              {issue.is_verified && (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>

                            <div className="mb-3">
                              <p className="font-mono text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-xl">
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
                                <summary className="text-sm font-bold text-gray-700 cursor-pointer hover:text-[#526450] transition-colors">
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
                    <div className="glass rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300 p-12 text-center">
                      <div className="text-7xl mb-4">✅</div>
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
            <div className="glass rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                <span className="text-3xl">📜</span>
                Check History
              </h2>

              {checkHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg mb-6">No citation checks yet</p>
                  <button
                    onClick={() => setActiveTab('check')}
                    className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Check your first document →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkHistory.map((check) => (
                    <div
                      key={check.check_id}
                      onClick={() => loadCheckDetail(check.check_id)}
                      className="glass rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#3D2F28] text-lg">{check.document_name}</h3>
                        <span className={`text-3xl font-black ${getScoreColor(check.overall_score)}`}>
                          {check.overall_score.toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white rounded-full text-xs font-bold capitalize">
                          {check.citation_format}
                        </span>
                        <span className="text-gray-500">{new Date(check.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          📊 {check.total_citations_found} citations
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          ✅ {check.valid_citations}
                        </span>
                        {check.invalid_citations > 0 && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            ❌ {check.invalid_citations}
                          </span>
                        )}
                        {check.warnings > 0 && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
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
      </div>
    </div>
  )
}
