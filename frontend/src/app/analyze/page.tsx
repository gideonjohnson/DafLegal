"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { useAskBar } from '@/hooks/useAskBar'

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

interface AnalysisHistory {
  id: string
  filename: string
  timestamp: Date
  risk_score: number
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'obligations' | 'risks' | 'revisions'>('summary')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const { triggerAsk } = useAskBar()

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

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('analysis-history')
    if (saved) {
      const parsed = JSON.parse(saved)
      setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })))
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        triggerAsk('How can I improve this document?')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && result) {
        e.preventDefault()
        handleExport()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [result])

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

      // Add to history
      const newHistory: AnalysisHistory = {
        id: data.analysis_id,
        filename: data.filename,
        timestamp: new Date(),
        risk_score: data.overall_risk_score
      }
      const updated = [newHistory, ...history].slice(0, 10)
      setHistory(updated)
      localStorage.setItem('analysis-history', JSON.stringify(updated))
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
    setSearchQuery('')
  }

  const handleExport = () => {
    if (!result) return

    // Create markdown report
    const markdown = `# Document Analysis Report
**File:** ${result.filename}
**Date:** ${new Date().toLocaleString()}
**Document Type:** ${result.document_type}

## Scores
- **Risk Score:** ${result.overall_risk_score.toFixed(1)}/10
- **Clarity Score:** ${result.clarity_score}%
- **Compliance Score:** ${result.compliance_score}%

## Summary
${result.summary}

## Key Findings
${result.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Obligations (${result.obligations.length})
${result.obligations.map(o => `
### ${o.party} - ${o.type}
**Criticality:** ${o.criticality}
${o.description}
${o.deadline ? `**Deadline:** ${o.deadline}` : ''}
`).join('\n')}

## Risk Flags (${result.risk_flags.length})
${result.risk_flags.map(r => `
### ${r.title} (${r.severity})
${r.description}
${r.location ? `**Location:** ${r.location}` : ''}
**Recommendation:** ${r.recommendation}
`).join('\n')}

## Suggested Revisions (${result.suggested_revisions.length})
${result.suggested_revisions.map(r => `
### ${r.section} (${r.priority} priority)
**Issue:** ${r.issue}
**Current:** ${r.current_text}
**Suggested:** ${r.suggested_text}
**Reason:** ${r.reason}
`).join('\n')}

---
Generated by DafLegal - AI Legal Assistant
`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${result.filename}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
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

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  // Filter results based on search
  const filterItems = <T extends { description?: string; title?: string; summary?: string }>(items: T[]) => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      (item.description?.toLowerCase().includes(query)) ||
      (item.title?.toLowerCase().includes(query)) ||
      (item.summary?.toLowerCase().includes(query))
    )
  }

  // Circular progress component
  const CircularProgress = ({ value, max, color, label }: { value: number, max: number, color: string, label: string }) => {
    const percentage = (value / max) * 100
    const circumference = 2 * Math.PI * 40
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-[#1a2e1a]"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${color}`}>
            {max === 10 ? value.toFixed(1) : `${Math.round(value)}%`}
          </span>
          <span className="text-xs text-[#d4c4a8] mt-1">{label}</span>
        </div>
      </div>
    )
  }

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

      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
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

              {/* Quick Actions */}
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="btn-ghost flex items-center gap-2 group"
                    title="Export report (Ctrl+E)"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn-ghost flex items-center gap-2 group"
                    title="View history"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </button>
                  <button
                    onClick={() => triggerAsk('Explain this document analysis')}
                    className="btn-primary flex items-center gap-2"
                    title="Ask AI (Ctrl+K)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Ask AI
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${showHistory ? 'max-w-5xl' : ''}`}>
              {!result ? (
                /* Upload Section */
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                  <div className="card-dark p-8">
                    <div
                      {...getRootProps()}
                      className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'border-[#8faf98]' : ''} min-h-[300px] flex flex-col items-center justify-center`}
                    >
                      <input {...getInputProps()} />

                      {file ? (
                        <div className="text-center animate-scale-in">
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
                      <div className="alert alert-error mt-6 animate-shake">
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
                      className="btn-primary w-full py-4 text-lg mt-6 disabled:opacity-50 group"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="spinner mr-3" />
                          {uploadProgress < 100 ? 'Uploading...' : 'Analyzing document...'}
                        </div>
                      ) : (
                        <>
                          Analyze Document
                          <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>

                    {/* Features */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      {[
                        { icon: '📋', label: 'Obligations', desc: 'Extract all duties' },
                        { icon: '⚠️', label: 'Risk Flags', desc: 'Identify issues' },
                        { icon: '📝', label: 'Summary', desc: 'Plain English' },
                        { icon: '✏️', label: 'Revisions', desc: 'Suggested changes' },
                      ].map((f, idx) => (
                        <div key={f.label} className="card-glass p-4 text-center hover:scale-105 transition-transform animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
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
                <div className="space-y-6 animate-fade-in-up">
                  {/* Back button */}
                  <button onClick={resetAnalysis} className="btn-ghost flex items-center group">
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Analyze Another Document
                  </button>

                  {/* Document Info & Circular Scores */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 card-dark p-6">
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

                    <div className="card-dark p-6 flex items-center justify-center">
                      <CircularProgress
                        value={result.overall_risk_score}
                        max={10}
                        color={getScoreColor(result.overall_risk_score, true)}
                        label="Risk Score"
                      />
                    </div>

                    <div className="card-dark p-6 flex items-center justify-center">
                      <CircularProgress
                        value={result.clarity_score}
                        max={100}
                        color={getScoreColor(result.clarity_score)}
                        label="Clarity"
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: result.obligations.length, label: 'Obligations', color: 'text-[#f2e8d5]' },
                      { value: result.risk_flags.length, label: 'Risk Flags', color: 'text-red-400' },
                      { value: result.suggested_revisions.length, label: 'Revisions', color: 'text-yellow-400' },
                    ].map((stat, idx) => (
                      <div key={stat.label} className="card-glass p-4 text-center hover:scale-105 transition-transform animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-[#d4c4a8]">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Search Bar */}
                  {(result.obligations.length > 0 || result.risk_flags.length > 0) && (
                    <div className="card-glass p-4 flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#d4c4a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search findings..."
                        className="flex-1 bg-transparent border-none outline-none text-[#f2e8d5] placeholder:text-[#d4c4a8]/50"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-[#d4c4a8] hover:text-[#f2e8d5]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="tabs inline-flex">
                    <button onClick={() => setActiveTab('summary')} className={`tab ${activeTab === 'summary' ? 'active' : ''}`}>Summary</button>
                    <button onClick={() => setActiveTab('obligations')} className={`tab ${activeTab === 'obligations' ? 'active' : ''}`}>Obligations ({result.obligations.length})</button>
                    <button onClick={() => setActiveTab('risks')} className={`tab ${activeTab === 'risks' ? 'active' : ''}`}>Risks ({result.risk_flags.length})</button>
                    <button onClick={() => setActiveTab('revisions')} className={`tab ${activeTab === 'revisions' ? 'active' : ''}`}>Revisions ({result.suggested_revisions.length})</button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'summary' && (
                    <div className="card-dark p-8 space-y-6 animate-slide-in">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-[#f2e8d5]">Summary</h3>
                          <button onClick={() => handleCopy(result.summary)} className="btn-ghost btn-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[#e5d9c3] leading-relaxed text-lg">{result.summary}</p>
                      </div>

                      {result.key_findings.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-[#f2e8d5] mb-4">Key Findings</h3>
                          <div className="space-y-3">
                            {result.key_findings.map((finding, idx) => (
                              <div key={idx} className="card-glass p-4 flex items-start gap-3 hover:scale-[1.02] transition-transform">
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
                    <div className="card-dark p-8 animate-slide-in">
                      <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Obligations Extracted</h3>
                      {filterItems(result.obligations).length === 0 ? (
                        <p className="text-[#d4c4a8] text-center py-8">
                          {searchQuery ? 'No obligations match your search' : 'No specific obligations identified'}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {filterItems(result.obligations).map((ob, idx) => (
                            <div key={idx} className="card-glass p-5 hover:scale-[1.01] transition-transform">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="font-bold text-[#d4c4a8]">{ob.party}</span>
                                  <span
                                    className={getCriticalityBadge(ob.criticality)}
                                    onMouseEnter={() => setShowTooltip(`crit-${idx}`)}
                                    onMouseLeave={() => setShowTooltip(null)}
                                    title="Criticality level"
                                  >
                                    {ob.criticality.toUpperCase()}
                                  </span>
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
                    <div className="card-dark p-8 animate-slide-in">
                      <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Risk Flags</h3>
                      {filterItems(result.risk_flags).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[#8faf98] text-xl mb-2">
                            {searchQuery ? 'No risks match your search' : 'No significant risks identified'}
                          </p>
                          {!searchQuery && <p className="text-[#d4c4a8]">The document appears to be well-structured</p>}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filterItems(result.risk_flags).map((risk, idx) => (
                            <div key={idx} className={`card-glass p-5 border-l-4 hover:scale-[1.01] transition-transform ${
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
                    <div className="card-dark p-8 animate-slide-in">
                      <h3 className="text-xl font-bold text-[#f2e8d5] mb-6">Suggested Revisions</h3>
                      {result.suggested_revisions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-[#8faf98] text-xl mb-2">No revisions suggested</p>
                          <p className="text-[#d4c4a8]">The document language appears acceptable</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {result.suggested_revisions.map((rev, idx) => (
                            <div key={idx} className="card-glass p-5 hover:scale-[1.01] transition-transform">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-[#f2e8d5]">{rev.section}</span>
                                  <span className={`badge text-xs ${rev.priority === 'high' ? 'badge-error' : rev.priority === 'medium' ? 'badge-warning' : 'badge'}`}>
                                    {rev.priority.toUpperCase()} PRIORITY
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleSection(idx)}
                                  className="text-[#d4c4a8] hover:text-[#f2e8d5]"
                                >
                                  <svg className={`w-5 h-5 transition-transform ${expandedSections.has(idx) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                              <p className="text-[#d4c4a8] mb-4">{rev.issue}</p>

                              {(!expandedSections.has(idx) || expandedSections.has(idx)) && (
                                <div className="grid md:grid-cols-2 gap-4 animate-expand">
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
                              )}

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

            {/* History Sidebar */}
            {showHistory && (
              <div className="w-80 shrink-0 animate-slide-in-right">
                <div className="card-dark p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#f2e8d5]">Recent Analyses</h3>
                    <button onClick={() => setShowHistory(false)} className="text-[#d4c4a8] hover:text-[#f2e8d5]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {history.length === 0 ? (
                    <p className="text-[#d4c4a8] text-center py-8 text-sm">No analysis history yet</p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {history.map((item) => (
                        <div key={item.id} className="card-glass p-4 hover:scale-[1.02] transition-transform cursor-pointer">
                          <p className="text-sm font-semibold text-[#f2e8d5] truncate">{item.filename}</p>
                          <p className="text-xs text-[#d4c4a8] mt-1">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#d4c4a8]">Risk:</span>
                            <span className={`text-sm font-bold ${getScoreColor(item.risk_score, true)}`}>
                              {item.risk_score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expand {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }

        .animate-expand {
          animation: expand 0.3s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }

        .spinner {
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </div>
  )
}
