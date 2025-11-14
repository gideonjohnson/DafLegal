"use client"

import { useState, useEffect } from 'react'

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

export default function DraftingAssistant() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [contractName, setContractName] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null)
  const [myContracts, setMyContracts] = useState<GeneratedContract[]>([])
  const [activeTab, setActiveTab] = useState<'templates' | 'generated'>('templates')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/v1/drafting/templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
      })
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadMyContracts = async () => {
    try {
      const res = await fetch('/api/v1/drafting/contracts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
      })
      const data = await res.json()
      setMyContracts(data)
    } catch (error) {
      console.error('Failed to load contracts:', error)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setContractName('')
    setVariableValues({})
    setGeneratedContract(null)
  }

  const handleGenerate = async () => {
    if (!selectedTemplate || !contractName) return

    setLoading(true)
    try {
      const res = await fetch('/api/v1/drafting/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`
        },
        body: JSON.stringify({
          template_id: selectedTemplate.template_id,
          name: contractName,
          variable_values: variableValues,
          selected_clauses: [],
          file_format: 'docx'
        })
      })
      const contract = await res.json()
      setGeneratedContract(contract)
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Drafting Assistant</h2>
        <p className="mt-1 text-sm text-gray-600">Generate contracts from templates with AI enhancement</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Contract
          </button>
          <button
            onClick={() => { setActiveTab('generated'); loadMyContracts() }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generated' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Contracts ({myContracts.length})
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Choose Template</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.template_id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedTemplate?.template_id === template.template_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{template.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{template.jurisdiction}</span>
                    <span className="text-xs text-gray-500">Used {template.times_used}x</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          {selectedTemplate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Fill Details</h3>
              <div className="bg-white shadow rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Name</label>
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="e.g., Employment Agreement - John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variable.description}
                      {variable.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => setVariableValues({...variableValues, [variable.name]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  disabled={loading || !contractName}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? 'Generating...' : 'Generate Contract'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Contract */}
      {generatedContract && activeTab === 'templates' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated: {generatedContract.name}</h3>
            <span className={`px-3 py-1 rounded text-sm ${
              generatedContract.risk_analysis.overall_risk === 'low' ? 'bg-green-100 text-green-800' :
              generatedContract.risk_analysis.overall_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Risk: {generatedContract.risk_analysis.overall_risk}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{generatedContract.generated_text}</pre>
          </div>

          {generatedContract.ai_suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">AI Suggestions</h4>
              <div className="space-y-2">
                {generatedContract.ai_suggestions.map((sugg, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-900">{sugg.section}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        sugg.priority === 'high' ? 'bg-red-100 text-red-700' :
                        sugg.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{sugg.priority}</span>
                    </div>
                    <p className="text-sm text-blue-800">{sugg.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Contracts Tab */}
      {activeTab === 'generated' && (
        <div className="space-y-4">
          {myContracts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No generated contracts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myContracts.map((contract) => (
                <div key={contract.generated_id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{contract.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{contract.category}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{contract.status}</span>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
