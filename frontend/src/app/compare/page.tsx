'use client'
import Image from 'next/image'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { Navigation } from '@/components/Navigation'
import { useAskBar } from '@/hooks/useAskBar'

interface ComparisonResult {
  comparison_id: string
  summary?: string
  additions: any[]
  deletions: any[]
  modifications: any[]
  clause_changes: any[]
  risk_delta?: number
  substantive_changes: any[]
  cosmetic_changes: any[]
}

export default function ComparePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [revisedFile, setRevisedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [showSideBySide, setShowSideBySide] = useState(false)
  const { triggerAsk } = useAskBar()

  // Original file dropzone
  const originalDropzone = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    onDrop: (files) => setOriginalFile(files[0])
  })

  // Revised file dropzone
  const revisedDropzone = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    onDrop: (files) => setRevisedFile(files[0])
  })

  const handleCompare = async () => {
    if (!originalFile || !revisedFile) {
      setError('Please upload both contract versions')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload original file
      const originalFormData = new FormData()
      originalFormData.append('file', originalFile)

      const originalResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/contracts/upload`,
        originalFormData,
        { headers: { Authorization: `Bearer demo-key` } }
      )

      // Upload revised file
      const revisedFormData = new FormData()
      revisedFormData.append('file', revisedFile)

      const revisedResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/contracts/upload`,
        revisedFormData,
        { headers: { Authorization: `Bearer demo-key` } }
      )

      // Create comparison
      const comparisonResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/comparisons/`,
        {
          original_contract_id: originalResponse.data.contract_id,
          revised_contract_id: revisedResponse.data.contract_id
        },
        { headers: { Authorization: `Bearer demo-key` } }
      )

      // Poll for results
      let attempts = 0
      const pollInterval = setInterval(async () => {
        attempts++
        try {
          const resultResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/comparisons/${comparisonResponse.data.comparison_id}`,
            { headers: { Authorization: `Bearer demo-key` } }
          )

          if (resultResponse.data.status === 'completed') {
            setComparison(resultResponse.data)
            setLoading(false)
            clearInterval(pollInterval)
          } else if (attempts >= 30) {
            setError('Comparison timed out')
            setLoading(false)
            clearInterval(pollInterval)
          }
        } catch (err) {
          setError('Failed to get comparison results')
          setLoading(false)
          clearInterval(pollInterval)
        }
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process comparison')
      setLoading(false)
    }
  }

  const getRiskColor = (delta?: number) => {
    if (!delta) return 'from-gray-400 to-gray-500'
    if (delta > 1) return 'from-red-500 to-red-600'
    if (delta > 0) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-green-600'
  }

  return (
    <div className="min-h-screen leather-bg relative overflow-hidden">
      {/* Background Image with Green Blend */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/webimg2.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e1a]/90 via-[#234023]/85 to-[#2d5a2d]/90"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
      <Navigation />
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="icon-3d w-20 h-20 bg-gradient-to-br from-[#3D2F28] via-[#5C4A3D] to-[#526450] rounded-3xl flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-black mb-4">Contract Comparison</h1>
          <p className="text-xl text-gray-600">Compare two versions side-by-side and track every change</p>
        </div>

        {!comparison ? (
          <div className="glass rounded-3xl p-8 shadow-xl max-w-5xl mx-auto">
            {/* Upload Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Original Contract */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Original Version</h3>
                <div
                  {...originalDropzone.getRootProps()}
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    originalDropzone.isDragActive
                      ? 'border-[#526450] bg-[#526450]/10 scale-105'
                      : originalFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-[#526450] hover:bg-gray-50'
                  }`}
                >
                  <input {...originalDropzone.getInputProps()} />
                  <div className="flex flex-col items-center">
                    {originalFile ? (
                      <>
                        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold text-black mb-2">{originalFile.name}</p>
                        <p className="text-sm text-gray-500">{(originalFile.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-semibold text-black mb-2">Drop your original contract</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">PDF or DOCX, max 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Revised Contract */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Revised Version</h3>
                <div
                  {...revisedDropzone.getRootProps()}
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    revisedDropzone.isDragActive
                      ? 'border-[#526450] bg-[#526450]/10 scale-105'
                      : revisedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-[#526450] hover:bg-gray-50'
                  }`}
                >
                  <input {...revisedDropzone.getInputProps()} />
                  <div className="flex flex-col items-center">
                    {revisedFile ? (
                      <>
                        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold text-black mb-2">{revisedFile.name}</p>
                        <p className="text-sm text-gray-500">{(revisedFile.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-semibold text-black mb-2">Drop your revised contract</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">PDF or DOCX, max 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Compare Button */}
            <button
              onClick={handleCompare}
              disabled={loading || !originalFile || !revisedFile}
              className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68] text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing contracts...
                </div>
              ) : (
                'Compare Contracts'
              )}
            </button>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                setComparison(null)
                setOriginalFile(null)
                setRevisedFile(null)
              }}
              className="text-gray-600 hover:text-black font-semibold flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Compare New Contracts
            </button>

            {/* Summary & Risk */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Summary */}
              {comparison.summary && (
                <div className="md:col-span-2 glass rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-[#526450]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{comparison.summary}</p>
                </div>
              )}

              {/* Risk Delta */}
              {comparison.risk_delta !== undefined && (
                <div className="glass rounded-2xl p-6 text-center">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Risk Change</h3>
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getRiskColor(comparison.risk_delta)} shadow-lg mb-3`}>
                    <span className="text-3xl font-bold text-white">
                      {comparison.risk_delta > 0 ? '+' : ''}{comparison.risk_delta.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {comparison.risk_delta > 0 ? 'Risk Increased' : comparison.risk_delta < 0 ? 'Risk Decreased' : 'No Change'}
                  </p>
                </div>
              )}
            </div>

            {/* Substantive Changes */}
            {comparison.substantive_changes.length > 0 && (
              <div className="glass rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full text-sm font-bold mr-3">
                    {comparison.substantive_changes.length}
                  </span>
                  Substantive Changes
                </h3>
                <div className="space-y-4">
                  {comparison.substantive_changes.map((change, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border-2 border-orange-100">
                      {change.location && (
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
                          {change.location}
                        </span>
                      )}
                      {change.original_text && (
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <span className="text-xs font-bold text-red-600 uppercase">Original</span>
                          <p className="text-gray-700 mt-1 line-through">{change.original_text}</p>
                        </div>
                      )}
                      {change.revised_text && (
                        <div>
                          <span className="text-xs font-bold text-green-600 uppercase">Revised</span>
                          <p className="text-gray-700 mt-1">{change.revised_text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clause Changes */}
            {comparison.clause_changes.length > 0 && (
              <div className="glass rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold mr-3">
                    {comparison.clause_changes.length}
                  </span>
                  Clause Changes
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {comparison.clause_changes.map((change, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border-2 border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-black capitalize">
                          {change.clause_type.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          change.change_type === 'added' ? 'bg-green-100 text-green-700' :
                          change.change_type === 'removed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {change.change_type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{change.impact_summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cosmetic Changes */}
            {comparison.cosmetic_changes.length > 0 && (
              <details className="glass rounded-2xl p-6">
                <summary className="text-lg font-bold text-black cursor-pointer flex items-center justify-between">
                  <span>Cosmetic Changes ({comparison.cosmetic_changes.length})</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 space-y-2">
                  {comparison.cosmetic_changes.map((change, idx) => (
                    <div key={idx} className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                      {change.location && <span className="font-semibold">{change.location}: </span>}
                      <span className="line-through">{change.original_text}</span> → {change.revised_text}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
      </div>
  )
}
