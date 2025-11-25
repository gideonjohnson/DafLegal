"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Navigation } from '@/components/Navigation'

interface Obligation {
  party: string
  description: string
  deadline: string | null
  type: string
  criticality: string
}

interface RiskFlag {
  severity: string
  title: string
  description: string
  location: string | null
  recommendation: string
}

interface SuggestedRevision {
  section: string
  issue: string
  current_text: string
  suggested_text: string
  reason: string
  priority: string
}

interface AnalysisResult {
  analysis_id: string
  filename: string
  document_type: string
  page_count: number
  word_count: number
  processing_time_seconds: number
  summary: string
  key_findings: string[]
  obligations: Obligation[]
  risk_flags: RiskFlag[]
  suggested_revisions: SuggestedRevision[]
  overall_risk_score: number
  compliance_score: number
  clarity_score: number
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'obligations' | 'risks' | 'revisions'>('summary')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError('')
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024
  })

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('http://localhost:8000/api/v1/instant-analysis/analyze', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer demo-key' },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Analysis failed')
      }

      const data = await response.json()
      setResult(data)
      setActiveTab('summary')
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document')
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setError('')
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'badge-error'
      case 'high': return 'badge-error'
      case 'medium': return 'badge-warning'
      default: return 'badge'
    }
  }

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'badge-error'
      case 'high': return 'badge-warning'
      case 'medium': return 'badge'
      default: return 'badge-success'
    }
  }

  const getScoreColor = (score: number, inverse: boolean = false) => {
    if (inverse) {
      if (score <= 3) return 'text-[#8faf98]'
      if (score <= 6) return 'text-yellow-400'
      return 'text-red-400'
    }
    if (score >= 80) return 'text-[#8faf98]'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen leather-bg">
      <Navigation />
      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="icon-box w-14 h-14 rounded-xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="heading-lg">Instant Document Analysis</h1>
                <p className="text-[#d4c4a8] text-lg mt-1">Upload any document and get AI-powered analysis in seconds</p>
              </div>
            </div>
          </div>

          {!result ? (
            /* Upload Section */
            <div className="max-w-3xl mx-auto">
              <div className="card-dark p-8">
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'border-[#8faf98]' : ''} min-h-[300px] flex flex-col items-center justify-center`}
                >
                  <input {...getInputProps()} />

                  {file ? (
                    <div className="text-center">
                      <div className="w-20 h-20 icon-box rounded-2xl mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-[#f2e8d5] mb-2">{file.name}</p>
                      <p className="text-[#d4c4a8] mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                        className="text-sm text-[#d4c4a8] hover:text-[#f2e8d5] underline"
                      >
                        Remove and choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 icon-box-outline rounded-2xl mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-[#f2e8d5] mb-2">
                        {isDragActive ? 'Drop your document here' : 'Drag & drop your document'}
                      </p>
                      <p className="text-[#d4c4a8] mb-4">or click to browse</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="badge">PDF</span>
                        <span className="badge">DOCX</span>
                        <span className="badge">DOC</span>
                        <span className="badge">TXT</span>
                      </div>
                      <p className="text-xs text-[#d4c4a8] opacity-60 mt-4">Max file size: 25MB</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-error mt-6">
                    <p className="text-[#e8a8a8] font-medium">{error}</p>
                  </div>
                )}

                {loading && uploadProgress > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-[#a8c4a8] mb-2">
                      <span>{uploadProgress < 100 ? 'Uploading...' : 'Processing...'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1a2e1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4b377] to-[#b8965a] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="btn-primary w-full py-4 text-lg mt-6 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-3" />
                      {uploadProgress < 100 ? 'Uploading...' : 'Analyzing document...'}
                    </div>
                  ) : (
                    'Analyze Document'
                  )}
                </button>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { icon: '📋', label: 'Obligations', desc: 'Extract all duties' },
                    { icon: '⚠️', label: 'Risk Flags', desc: 'Identify issues' },
                    { icon: '📝', label: 'Summary', desc: 'Plain English' },
                    { icon: '✏️', label: 'Revisions', desc: 'Suggested changes' },
                  ].map((f) => (
                    <div key={f.label} className="card-glass p-4 text-center">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <p className="font-bold text-[#f2e8d5] text-sm">{f.label}</p>
                      <p className="text-xs text-[#d4c4a8]">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-6">
              {/* Back button */}
              <button onClick={resetAnalysis} className="btn-ghost flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Analyze Another Document
              </button>

              {/* Document Info & Scores */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-2 card-dark p-6">
                  <div className="flex items-start gap-4">
                    <div className="icon-box w-14 h-14 rounded-xl shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#f2e8d5] truncate">{result.filename}</h3>
                      <p className="text-[#d4c4a8] mt-1">{result.document_type}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#d4c4a8]">
                        <span>{result.page_count} pages</span>
                        <span>|</span>
                        <span>{result.word_count.toLocaleString()} words</span>
                        <span>|</span>
                        <span className="text-[#8faf98]">{result.processing_time_seconds}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-dark p-6 text-center">
                  <p className="text-sm text-[#d4c4a8] mb-2">Risk Score</p>
                  <p className={`text-4xl font-black ${getScoreColor(result.overall_risk_score, true)}`}>
                    {result.overall_risk_score.toFixed(1)}
                  </p>
                  <p className="text-xs text-[#d4c4a8] mt-1">out of 10</p>
                </div>

                <div className="card-dark p-6 text-center">
                  <p className="text-sm text-[#d4c4a8] mb-2">Clarity Score</p>
                  <p className={`text-4xl font-black ${getScoreColor(result.clarity_score)}`}>
                    {result.clarity_score.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card-glass p-4 text-center">
                  <p className="text-3xl font-bold text-[#f2e8d5]">{result.obligations.length}</p>
                  <p className="text-sm text-[#d4c4a8]">Obligations</p>
                </div>
                <div className="card-glass p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">{result.risk_flags.length}</p>
                  <p className="text-sm text-[#d4c4a8]">Risk Flags</p>
                </div>
                <div className="card-glass p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{result.suggested_revisions.length}</p>
                  <p className="text-sm text-[#d4c4a8]">Revisions</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs inline-flex">
                <button onClick={() => setActiveTab('summary')} className={`tab ${activeTab === 'summary' ? 'active' : ''}`}>Summary</button>
                <button onClick={() => setActiveTab('obligations')} className={`tab ${activeTab === 'obligations' ? 'active' : ''}`}>Obligations ({result.obligations.length})</button>
                <button onClick={() => setActiveTab('risks')} className={`tab ${activeTab === 'risks' ? 'active' : ''}`}>Risks ({result.risk_flags.length})</button>
                <button onClick={() => setActiveTab('revisions')} className={`tab ${activeTab === 'revisions' ? 'active' : ''}`}>Revisions ({result.suggested_revisions.length})</button>
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' && (
                <div className="card-dark p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#f2e8d5] mb-4">Summary</h3>
                    <p className="text-[#e5d9c3] leading-relaxed text-lg">{result.summary}</p>
                  </div>

                  {result.key_findings.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[#f2e8d5] mb-4">Key Findings</h3>
                      <div className="space-y-3">
                        {result.key_findings.map((finding, idx) => (
                          <div key={idx} className="card-glass p-4 flex items-start gap-3">
                            <span className="icon-box w-8 h-8 rounded-lg shrink-0 text-sm">{idx + 1}</span>
                            <p className="text-[#e5d9c3]">{finding}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'obligations' && (
                <div className="card-dark p-8">
                  <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Obligations Extracted</h3>
                  {result.obligations.length === 0 ? (
                    <p className="text-[#d4c4a8] text-center py-8">No specific obligations identified</p>
                  ) : (
                    <div className="space-y-4">
                      {result.obligations.map((ob, idx) => (
                        <div key={idx} className="card-glass p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#d4c4a8]">{ob.party}</span>
                              <span className={getCriticalityBadge(ob.criticality)}>{ob.criticality.toUpperCase()}</span>
                              <span className="badge text-xs">{ob.type}</span>
                            </div>
                          </div>
                          <p className="text-[#e5d9c3] mb-2">{ob.description}</p>
                          {ob.deadline && (
                            <p className="text-sm text-[#d4c4a8]">
                              <span className="font-semibold">Deadline:</span> {ob.deadline}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="card-dark p-8">
                  <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Risk Flags</h3>
                  {result.risk_flags.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#8faf98] text-xl mb-2">No significant risks identified</p>
                      <p className="text-[#d4c4a8]">The document appears to be well-structured</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {result.risk_flags.map((risk, idx) => (
                        <div key={idx} className={`card-glass p-5 border-l-4 ${
                          risk.severity === 'critical' || risk.severity === 'high' ? 'border-red-400' :
                          risk.severity === 'medium' ? 'border-yellow-400' : 'border-[#d4c4a8]'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-[#f2e8d5]">{risk.title}</h4>
                            <span className={getSeverityBadge(risk.severity)}>{risk.severity.toUpperCase()}</span>
                          </div>
                          <p className="text-[#e5d9c3] mb-3">{risk.description}</p>
                          {risk.location && (
                            <p className="text-sm text-[#d4c4a8] mb-2">Location: {risk.location}</p>
                          )}
                          <div className="mt-3 pt-3 border-t border-[#d4c4a8]/10">
                            <p className="text-sm font-bold text-[#d4c4a8] mb-1">Recommendation:</p>
                            <p className="text-sm text-[#8faf98]">{risk.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'revisions' && (
                <div className="card-dark p-8">
                  <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Suggested Revisions</h3>
                  {result.suggested_revisions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#8faf98] text-xl mb-2">No revisions suggested</p>
                      <p className="text-[#d4c4a8]">The document language appears acceptable</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {result.suggested_revisions.map((rev, idx) => (
                        <div key={idx} className="card-glass p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#f2e8d5]">{rev.section}</span>
                              <span className={`badge text-xs ${rev.priority === 'high' ? 'badge-error' : rev.priority === 'medium' ? 'badge-warning' : 'badge'}`}>
                                {rev.priority.toUpperCase()} PRIORITY
                              </span>
                            </div>
                          </div>
                          <p className="text-[#d4c4a8] mb-4">{rev.issue}</p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-red-400 uppercase mb-2">Current Text</p>
                              <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-3">
                                <p className="text-sm text-[#e5d9c3] line-through opacity-70">{rev.current_text}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#8faf98] uppercase mb-2">Suggested Text</p>
                              <div className="bg-[#8faf98]/10 border border-[#8faf98]/30 rounded-xl p-3">
                                <p className="text-sm text-[#e5d9c3]">{rev.suggested_text}</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-[#d4c4a8] mt-4">
                            <span className="font-semibold">Reason:</span> {rev.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
