'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ContractAnalysisProps {
  apiKey: string
  contractId: string
  onReset: () => void
}

interface Analysis {
  contract_id: string
  status: string
  executive_summary: string[]
  key_terms: {
    parties: string[]
    effective_date: string | null
    term: string | null
    payment: string | null
  }
  detected_clauses: Array<{
    type: string
    risk_level: string
    text: string
    explanation: string
  }>
  missing_clauses: string[]
  risk_score: number
  overall_risk_level: string
  pages_processed: number
  processing_time_seconds: number | null
}

export function ContractAnalysis({ apiKey, contractId, onReset }: ContractAnalysisProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/contracts/${contractId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        )
        setAnalysis(response.data)
        setLoading(false)
      } catch (err: any) {
        if (err.response?.status === 202) {
          // Still processing, poll again
          setTimeout(fetchAnalysis, 2000)
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch analysis')
          setLoading(false)
        }
      }
    }

    fetchAnalysis()
  }, [apiKey, contractId])

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'high': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Contract...</h2>
        <p className="text-gray-600">This usually takes 10-20 seconds</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-red-600 mb-4">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contract Analysis</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
        >
          Upload Another
        </button>
      </div>

      {/* Risk Score */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Overall Risk Assessment</p>
            <p className={`text-2xl font-bold inline-block px-4 py-1 rounded-lg ${getRiskColor(analysis.overall_risk_level)}`}>
              {analysis.overall_risk_level.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{analysis.risk_score.toFixed(1)}</p>
            <p className="text-sm text-gray-600">out of 10</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
        <ul className="space-y-2">
          {analysis.executive_summary.map((point, i) => (
            <li key={i} className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Key Terms */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Terms</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Parties</p>
            <p className="font-medium text-gray-900">
              {analysis.key_terms.parties.join(', ') || 'Not specified'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Effective Date</p>
            <p className="font-medium text-gray-900">
              {analysis.key_terms.effective_date || 'Not specified'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Term</p>
            <p className="font-medium text-gray-900">
              {analysis.key_terms.term || 'Not specified'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Payment</p>
            <p className="font-medium text-gray-900">
              {analysis.key_terms.payment || 'Not specified'}
            </p>
          </div>
        </div>
      </section>

      {/* Detected Clauses */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detected Clauses</h3>
        <div className="space-y-4">
          {analysis.detected_clauses.map((clause, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 capitalize">
                  {clause.type.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(clause.risk_level)}`}>
                  {clause.risk_level.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 italic mb-2">"{clause.text.substring(0, 200)}..."</p>
              <p className="text-sm text-gray-700">{clause.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Missing Clauses */}
      {analysis.missing_clauses.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Missing Standard Clauses</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              The following standard clauses were not detected:
            </p>
            <ul className="space-y-1">
              {analysis.missing_clauses.map((clause, i) => (
                <li key={i} className="flex items-center text-yellow-900">
                  <span className="mr-2">⚠️</span>
                  <span className="capitalize">{clause.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Metadata */}
      <div className="text-sm text-gray-500 border-t pt-4">
        <p>Contract ID: {analysis.contract_id}</p>
        <p>Pages Processed: {analysis.pages_processed}</p>
        {analysis.processing_time_seconds && (
          <p>Processing Time: {analysis.processing_time_seconds.toFixed(1)}s</p>
        )}
      </div>
    </div>
  )
}
