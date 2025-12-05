"use client"
import Image from 'next/image'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Navigation } from '@/components/Navigation'
import { useAskBar } from '@/hooks/useAskBar'

interface Template {
  template_id: string
  name: string
  description: string
  category: string
  jurisdiction: string
  variables: Array<{name: string, type: string, description: string, required: boolean}>
  times_used: number
}

interface GeneratedContract {
  generated_id: string
  name: string
  category: string
  generated_text: string
  status: string
  ai_suggestions: Array<{type: string, section: string, suggestion: string, priority: string}>
  risk_analysis: {overall_risk: string, risk_factors: string[], recommendations: string[]}
  created_at: string
}

export default function DraftingPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [contractName, setContractName] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null)
  const [myContracts, setMyContracts] = useState<GeneratedContract[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const { triggerAsk } = useAskBar()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/drafting/templates', {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      setTemplates(res.data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadMyContracts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/drafting/contracts', {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      setMyContracts(res.data)
    } catch (error) {
      console.error('Failed to load contracts:', error)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setContractName('')
    setVariableValues({})
    setGeneratedContract(null)
    setShowPreview(false)
  }

  const handleGenerate = async () => {
    if (!selectedTemplate || !contractName) return

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/v1/drafting/generate', {
        template_id: selectedTemplate.template_id,
        name: contractName,
        variable_values: variableValues,
        selected_clauses: [],
        file_format: 'docx'
      }, {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      setGeneratedContract(res.data)
      setShowPreview(true)
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate contract')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (contractId: string, format: 'docx' | 'pdf') => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/drafting/contracts/${contractId}/download?format=${format}`,
        {
          headers: { 'Authorization': 'Bearer demo-key' },
          responseType: 'blob'
        }
      )
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'employment': '💼',
      'nda': '🤐',
      'service_agreement': '🤝',
      'lease': '🏢',
      'partnership': '🤲',
      'purchase': '🛒',
      'consulting': '💡',
      'license': '📜'
    }
    return icons[category] || '📄'
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      case 'low': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
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
        <Navigation />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
            ✍️ Drafting Assistant
          </h1>
          <p className="text-gray-600 text-lg">Generate professional contracts from AI-powered templates</p>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-2 mb-8 inline-flex">
          <button
            onClick={() => { setActiveTab('create'); setShowPreview(false) }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'create'
                ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            ✨ Create New
          </button>
          <button
            onClick={() => { setActiveTab('library'); loadMyContracts() }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'library'
                ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                : 'text-gray-700 hover:bg-white/30'
            }`}
          >
            📚 My Contracts ({myContracts.length})
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {!showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Step 1: Template Selection */}
                <div className="lg:col-span-1">
                  <div className="glass rounded-3xl p-6">
                    <h2 className="text-xl font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                      <span className="icon-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                      Choose Template
                    </h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {templates.map((template) => (
                        <button
                          key={template.template_id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`w-full text-left p-4 rounded-xl transition-all ${
                            selectedTemplate?.template_id === template.template_id
                              ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                              : 'bg-white/50 hover:bg-white/80 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                            <div className="flex-1">
                              <div className="font-semibold">{template.name}</div>
                              <div className={`text-sm mt-1 ${selectedTemplate?.template_id === template.template_id ? 'text-white/80' : 'text-gray-600'}`}>
                                {template.description}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-lg ${selectedTemplate?.template_id === template.template_id ? 'bg-white/20' : 'bg-[#6B7A68]/20 text-[#3D2F28]'}`}>
                                  {template.jurisdiction}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-lg ${selectedTemplate?.template_id === template.template_id ? 'bg-white/20' : 'bg-[#6B7A68]/20 text-[#3D2F28]'}`}>
                                  Used {template.times_used}×
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Fill Details */}
                {selectedTemplate && (
                  <div className="lg:col-span-2">
                    <div className="glass rounded-3xl p-6">
                      <h2 className="text-xl font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                        <span className="icon-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                        Fill Contract Details
                      </h2>

                      <div className="space-y-4">
                        {/* Contract Name */}
                        <div>
                          <label className="block text-sm font-semibold text-[#3D2F28] mb-2">
                            📝 Contract Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                            placeholder="e.g., Employment Agreement - John Doe"
                            className="w-full px-4 py-3 rounded-xl border-2 border-[#6B7A68]/30 focus:border-[#526450] focus:outline-none bg-white/70"
                          />
                        </div>

                        {/* Template Variables */}
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable.name}>
                            <label className="block text-sm font-semibold text-[#3D2F28] mb-2">
                              {variable.description}
                              {variable.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type={variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
                              value={variableValues[variable.name] || ''}
                              onChange={(e) => setVariableValues({...variableValues, [variable.name]: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-2 border-[#6B7A68]/30 focus:border-[#526450] focus:outline-none bg-white/70"
                            />
                          </div>
                        ))}

                        {/* Generate Button */}
                        <button
                          onClick={handleGenerate}
                          disabled={loading || !contractName}
                          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                            loading || !contractName
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white hover:scale-[1.02]'
                          }`}
                        >
                          {loading ? '✨ Generating with AI...' : '🚀 Generate Contract'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedTemplate && (
                  <div className="lg:col-span-2 flex items-center justify-center">
                    <div className="text-center glass rounded-3xl p-12">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-semibold text-[#3D2F28] mb-2">Select a Template</h3>
                      <p className="text-gray-600">Choose a template from the list to get started</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Preview Generated Contract */
              <div className="space-y-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-3d bg-white text-[#3D2F28] px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all"
                >
                  ← Back to Form
                </button>

                {generatedContract && (
                  <>
                    {/* Contract Header */}
                    <div className="glass rounded-3xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-[#3D2F28] mb-2">{generatedContract.name}</h2>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-lg bg-[#6B7A68]/20 text-[#3D2F28] text-sm font-medium">
                              {generatedContract.category}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getRiskColor(generatedContract.risk_analysis.overall_risk)}`}>
                              Risk: {generatedContract.risk_analysis.overall_risk.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(generatedContract.generated_id, 'docx')}
                            className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all"
                          >
                            📥 Download DOCX
                          </button>
                          <button
                            onClick={() => handleDownload(generatedContract.generated_id, 'pdf')}
                            className="btn-3d bg-gradient-to-r from-[#526450] to-[#6B7A68] text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all"
                          >
                            📄 Download PDF
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contract Text */}
                    <div className="glass rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                        📄 Contract Text
                      </h3>
                      <div className="bg-white rounded-xl p-6 max-h-[500px] overflow-y-auto border-2 border-[#6B7A68]/20">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                          {generatedContract.generated_text}
                        </pre>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    {generatedContract.ai_suggestions && generatedContract.ai_suggestions.length > 0 && (
                      <div className="glass rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                          💡 AI Suggestions
                        </h3>
                        <div className="space-y-3">
                          {generatedContract.ai_suggestions.map((suggestion, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-4 border-l-4 border-[#526450]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-[#3D2F28]">{suggestion.section}</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(suggestion.priority)}`}>
                                  {suggestion.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-700">{suggestion.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Risk Factors */}
                      {generatedContract.risk_analysis.risk_factors && generatedContract.risk_analysis.risk_factors.length > 0 && (
                        <div className="glass rounded-3xl p-6">
                          <h3 className="text-lg font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                            ⚠️ Risk Factors
                          </h3>
                          <ul className="space-y-2">
                            {generatedContract.risk_analysis.risk_factors.map((factor, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {generatedContract.risk_analysis.recommendations && generatedContract.risk_analysis.recommendations.length > 0 && (
                        <div className="glass rounded-3xl p-6">
                          <h3 className="text-lg font-bold text-[#3D2F28] mb-4 flex items-center gap-2">
                            ✅ Recommendations
                          </h3>
                          <ul className="space-y-2">
                            {generatedContract.risk_analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Contracts Library Tab */}
        {activeTab === 'library' && (
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-2">
              📚 My Contract Library
            </h2>

            {myContracts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-[#3D2F28] mb-2">No contracts yet</h3>
                <p className="text-gray-600 mb-6">Create your first contract to see it here</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
                >
                  ✨ Create Contract
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myContracts.map((contract) => (
                  <div key={contract.generated_id} className="bg-white rounded-xl p-5 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{getCategoryIcon(contract.category)}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getRiskColor(contract.risk_analysis.overall_risk)}`}>
                        {contract.risk_analysis.overall_risk.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#3D2F28] mb-2 line-clamp-2">{contract.name}</h4>
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 rounded-lg bg-[#6B7A68]/20 text-[#3D2F28] text-xs">
                        {contract.category}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs">
                        {contract.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Created: {new Date(contract.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGeneratedContract(contract)
                          setActiveTab('create')
                          setShowPreview(true)
                        }}
                        className="flex-1 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDownload(contract.generated_id, 'docx')}
                        className="btn-3d bg-white text-[#3D2F28] px-3 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
                      >
                        📥
                      </button>
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
