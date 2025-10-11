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
  const [error, setError] = useState<string | null>(null)

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

    setUploading(true)
    setError(null)

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
        }
      )

      onUploadSuccess(response.data.contract_id)
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to upload contract. Please try again.')
      }
    } finally {
      setUploading(false)
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
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Contract
      </h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${uploading || !apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="text-6xl mb-4">📄</div>

        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Uploading and analyzing...</p>
            <p className="text-sm text-gray-500 mt-2">This usually takes 10-20 seconds</p>
          </div>
        ) : !apiKey ? (
          <div>
            <p className="text-lg text-gray-500">Enter your API key above to get started</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-lg text-primary-600 font-semibold">Drop the file here</p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Drag & drop a contract here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF and DOCX files up to 25MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold mb-2">What happens next?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Your contract is securely uploaded to S3</li>
          <li>AI extracts and analyzes the text</li>
          <li>Clauses are detected and risk is assessed</li>
          <li>You receive a detailed JSON summary</li>
        </ol>
      </div>
    </div>
  )
}
