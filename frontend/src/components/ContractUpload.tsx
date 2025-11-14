'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ContractUploadProps {
  apiKey: string
  onUploadSuccess: (contractId: string) => void
}

export function ContractUpload({ apiKey, onUploadSuccess }: ContractUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!apiKey) {
      setError('Please enter your API key first')
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      setError('Only PDF and DOCX files are supported')
      return
    }

    // Validate file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('File too large. Maximum size: 25MB')
      return
    }

    setFileName(file.name)
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_URL}/api/v1/contracts/analyze`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            setUploadProgress(percentCompleted)
          },
        }
      )

      setSuccess(true)
      setTimeout(() => {
        onUploadSuccess(response.data.contract_id)
      }, 500)
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to upload contract. Please try again.')
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [apiKey, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading || !apiKey,
  })

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Contract
        </h2>
        {success && (
          <div className="flex items-center gap-2 text-green-600 animate-fade-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Upload successful!</span>
          </div>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-[#526450] bg-[#F5F1E8] scale-[1.02] shadow-lg'
            : 'border-gray-300 hover:border-[#3D2F28] hover:bg-gray-50'
        } ${uploading || !apiKey ? 'opacity-50 cursor-not-allowed' : ''} ${
          success ? 'border-[#526450] bg-[#E8E0D5]' : ''
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#3D2F28] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-black">{uploadProgress}%</span>
              </div>
            </div>

            {fileName && (
              <p className="text-sm font-medium text-gray-700 mb-2 truncate max-w-md mx-auto">
                {fileName}
              </p>
            )}

            <p className="text-lg font-semibold text-gray-900 mb-1">
              {uploadProgress < 100 ? 'Uploading...' : 'Analyzing contract...'}
            </p>
            <p className="text-sm text-gray-500">
              {uploadProgress < 100
                ? 'Securely transferring to our servers'
                : 'AI is reviewing your contract (10-20s)'}
            </p>

            {/* Progress bar */}
            <div className="mt-6 w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3D2F28] to-[#526450] transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            {/* Processing steps */}
            {uploadProgress === 100 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 animate-fade-in">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Uploaded</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  <span>Analyzing</span>
                </div>
              </div>
            )}
          </div>
        ) : !apiKey ? (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-lg text-gray-500">Enter your API key above to get started</p>
            <p className="text-sm text-gray-400 mt-2">Secure authentication required</p>
          </div>
        ) : isDragActive ? (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E8E0D5] flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl text-black font-semibold">Drop your contract here!</p>
            <p className="text-sm text-gray-700 mt-2">Release to start analysis</p>
          </div>
        ) : success ? (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E8E0D5] flex items-center justify-center">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl text-black font-semibold">Successfully uploaded!</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to results...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E8E0D5] to-[#8B7355] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              Drag & drop your contract here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your computer
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white rounded-lg font-medium hover:from-[#5C4A3D] hover:to-[#6B7A68] transition-all shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Select File
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span>PDF & DOCX</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Max 25MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">Upload failed</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!uploading && !error && (
        <div className="mt-8 p-6 bg-gradient-to-br from-[#F5F1E8] to-[#E8E0D5] rounded-xl border border-[#8B7355]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#3D2F28] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">What happens next?</p>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-black flex-shrink-0">1.</span>
                  <span>Your contract is <strong>securely uploaded</strong> to encrypted S3 storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-black flex-shrink-0">2.</span>
                  <span>AI <strong>extracts and analyzes</strong> the text using advanced NLP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-black flex-shrink-0">3.</span>
                  <span><strong>20+ clause types</strong> are automatically detected and categorized</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-black flex-shrink-0">4.</span>
                  <span><strong>Risk assessment</strong> is performed with quantified scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-black flex-shrink-0">5.</span>
                  <span>You receive a <strong>comprehensive JSON summary</strong> in 10-20 seconds</span>
                </li>
              </ol>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-4 border-t border-[#8B7355]">
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Bank-grade encryption</span>
            <span className="text-gray-400">•</span>
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">SOC 2 compliant</span>
            <span className="text-gray-400">•</span>
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">GDPR ready</span>
          </div>
        </div>
      )}
    </div>
  )
}
