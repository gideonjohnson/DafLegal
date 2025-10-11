'use client'

import { useState } from 'react'
import { ContractUpload } from '@/components/ContractUpload'
import { ContractAnalysis } from '@/components/ContractAnalysis'

export default function Home() {
  const [contractId, setContractId] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            DafLegal
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Upload contracts. Get intelligence. Simple API, powerful insights.
          </p>

          {/* API Key Input */}
          <div className="max-w-md mx-auto mb-8">
            <input
              type="password"
              placeholder="Enter your API key (dfk_...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Don't have an API key?{' '}
              <a href="/register" className="text-primary-600 hover:underline">
                Sign up for free
              </a>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!contractId ? (
            <ContractUpload
              apiKey={apiKey}
              onUploadSuccess={setContractId}
            />
          ) : (
            <ContractAnalysis
              apiKey={apiKey}
              contractId={contractId}
              onReset={() => setContractId(null)}
            />
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">Upload Contracts</h3>
            <p className="text-gray-600">
              Support for PDF and DOCX files up to 25MB
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              GPT-4o mini analyzes clauses, risks, and terms
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
            <p className="text-gray-600">
              Get insights in 10-20 seconds via simple API
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
