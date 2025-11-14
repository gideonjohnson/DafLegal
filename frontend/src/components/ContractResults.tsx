'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ContractResultsProps {
  contractId: string
  apiKey: string
}

interface ContractAnalysis {
  contract_id: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  executive_summary?: string[]
  key_terms?: {
    parties?: string[]
    effective_date?: string
    term?: string
    payment?: string
  }
  detected_clauses?: Array<{
    type: string
    risk_level: string
    text: string
    explanation: string
  }>
  missing_clauses?: string[]
  risk_score?: number
  overall_risk_level?: string
  pages_processed?: number
  processing_time_seconds?: number
  created_at?: string
}

export function ContractResults({ contractId, apiKey }: ContractResultsProps) {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingCount, setPollingCount] = useState(0)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/contracts/${contractId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        )

        setAnalysis(response.data)

        if (response.data.status === 'completed' || response.data.status === 'failed') {
          setLoading(false)
        } else {
          // Continue polling
          setPollingCount((prev) => prev + 1)
        }
      } catch (err: any) {
        if (err.response?.data?.detail) {
          setError(err.response.data.detail)
        } else {
          setError('Failed to fetch analysis results')
        }
        setLoading(false)
      }
    }

    // Initial fetch
    fetchAnalysis()

    // Poll every 2 seconds if still processing
    const interval = setInterval(() => {
      if (loading && pollingCount < 30) {
        fetchAnalysis()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [contractId, apiKey, loading, pollingCount])

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="p-8 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800 text-lg">Analysis Failed</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !analysis || analysis.status !== 'completed') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Loading Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Analyzing...</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-fade-in">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Uploaded</span>
            </div>
            <div className="flex-1 h-1 bg-blue-500 mx-4 animate-pulse"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Analyzing</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium text-gray-500">Complete</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            AI is extracting clauses and analyzing risk... ({pollingCount * 2}s elapsed)
          </p>
        </div>

        {/* Skeleton Loading States */}
        <div className="space-y-6">
          {/* Executive Summary Skeleton */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
            </div>
          </div>

          {/* Key Terms Skeleton */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Clauses Skeleton */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-40 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Completed analysis rendering
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Contract Analysis Complete</h2>
          <p className="text-gray-600">
            Analyzed {analysis.pages_processed} pages in {analysis.processing_time_seconds?.toFixed(1)}s
          </p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-lg">Success</span>
        </div>
      </div>

      {/* Risk Score */}
      {analysis.risk_score !== undefined && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Overall Risk Score</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">{analysis.risk_score.toFixed(1)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-2xl text-gray-500">10</span>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full font-semibold ${getRiskColor(analysis.overall_risk_level || 'medium')}`}>
              <div className="flex items-center gap-2">
                {getRiskIcon(analysis.overall_risk_level || 'medium')}
                <span className="uppercase text-sm">{analysis.overall_risk_level} Risk</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {analysis.executive_summary && analysis.executive_summary.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Executive Summary
          </h3>
          <ul className="space-y-3">
            {analysis.executive_summary.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Terms */}
      {analysis.key_terms && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Key Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.key_terms.parties && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Parties</p>
                <p className="text-gray-900 font-medium">{analysis.key_terms.parties.join(', ')}</p>
              </div>
            )}
            {analysis.key_terms.effective_date && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Effective Date</p>
                <p className="text-gray-900 font-medium">{analysis.key_terms.effective_date}</p>
              </div>
            )}
            {analysis.key_terms.term && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Term</p>
                <p className="text-gray-900 font-medium">{analysis.key_terms.term}</p>
              </div>
            )}
            {analysis.key_terms.payment && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Payment</p>
                <p className="text-gray-900 font-medium">{analysis.key_terms.payment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detected Clauses */}
      {analysis.detected_clauses && analysis.detected_clauses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Detected Clauses ({analysis.detected_clauses.length})
          </h3>
          <div className="space-y-4">
            {analysis.detected_clauses.map((clause, idx) => (
              <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getRiskColor(clause.risk_level)}`}>
                    {getRiskIcon(clause.risk_level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{clause.type.replace(/_/g, ' ')}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(clause.risk_level)}`}>
                        {clause.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 italic">&ldquo;{clause.text}&rdquo;</p>
                    <p className="text-sm text-gray-600">{clause.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Clauses */}
      {analysis.missing_clauses && analysis.missing_clauses.length > 0 && (
        <div className="p-6 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Missing Clauses</h3>
              <p className="text-sm text-yellow-800 mb-3">The following important clauses were not found in the contract:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_clauses.map((clause, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                    {clause.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
        <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF Report
          </div>
        </button>
        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </div>
        </button>
      </div>
    </div>
  )
}
