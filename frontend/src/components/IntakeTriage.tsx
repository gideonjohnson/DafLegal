'use client'

import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface IntakeTriageProps {
  apiKey: string
}

interface IntakeFormData {
  client_name: string
  client_email: string
  client_phone: string
  company: string
  is_existing_client: boolean
  matter_title: string
  matter_description: string
  matter_type: string
  practice_area: string
  urgency: string
  complexity: string
  estimated_value: string
  deadline: string
  deadline_description: string
  source: string
  referral_source: string
}

interface AIAnalysis {
  ai_category: string
  ai_practice_area: string
  ai_urgency: string
  ai_complexity: string
  confidence_score: number
  priority_score: number
  recommended_lawyers: Array<{
    user_id: number
    name: string
    specialization: string
    match_score: number
    match_reasons: string[]
  }>
  risk_factors: string[]
  ai_recommendations: string[]
}

export function IntakeTriage({ apiKey }: IntakeTriageProps) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intakeResult, setIntakeResult] = useState<any>(null)

  const [formData, setFormData] = useState<IntakeFormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    company: '',
    is_existing_client: false,
    matter_title: '',
    matter_description: '',
    matter_type: 'general',
    practice_area: 'general',
    urgency: 'medium',
    complexity: 'moderate',
    estimated_value: '',
    deadline: '',
    deadline_description: '',
    source: 'web_form',
    referral_source: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey) {
      setError('API key is required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        deadline: formData.deadline || null
      }

      const response = await axios.post(
        `${API_URL}/api/v1/intake/submit`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setIntakeResult(response.data)
      setStep(3)
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to submit intake. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      company: '',
      is_existing_client: false,
      matter_title: '',
      matter_description: '',
      matter_type: 'general',
      practice_area: 'general',
      urgency: 'medium',
      complexity: 'moderate',
      estimated_value: '',
      deadline: '',
      deadline_description: '',
      source: 'web_form',
      referral_source: ''
    })
    setIntakeResult(null)
    setError(null)
  }

  const renderPriorityBadge = (score: number) => {
    if (score >= 80) return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Critical Priority</span>
    if (score >= 60) return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">High Priority</span>
    if (score >= 40) return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Medium Priority</span>
    return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Low Priority</span>
  }

  const renderUrgencyBadge = (urgency: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    }
    return <span className={`px-2 py-1 ${colors[urgency as keyof typeof colors]} rounded text-xs font-medium uppercase`}>{urgency}</span>
  }

  const renderStep1 = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Client Intake - Step 1: Client Information</h2>

      <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Mwangi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Email *</label>
          <input
            type="email"
            name="client_email"
            value={formData.client_email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="client_phone"
            value={formData.client_phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+254712345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company name (if applicable)"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_existing_client"
            checked={formData.is_existing_client}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Existing Client</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
          <input
            type="text"
            name="referral_source"
            value={formData.referral_source}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How did the client find us?"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Next: Matter Details
          </button>
        </div>
      </form>
    </div>
  )

  const renderStep2 = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Client Intake - Step 2: Matter Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matter Title *</label>
          <input
            type="text"
            name="matter_title"
            value={formData.matter_title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Property Purchase - Westlands"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matter Description *</label>
          <textarea
            name="matter_description"
            value={formData.matter_description}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed description of the matter..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matter Type *</label>
            <select
              name="matter_type"
              value={formData.matter_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="real_estate">Real Estate / Conveyancing</option>
              <option value="corporate">Corporate</option>
              <option value="litigation">Litigation</option>
              <option value="employment">Employment</option>
              <option value="ip">Intellectual Property</option>
              <option value="family">Family Law</option>
              <option value="criminal">Criminal</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area *</label>
            <select
              name="practice_area"
              value={formData.practice_area}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="conveyancing">Conveyancing</option>
              <option value="contract">Contract Law</option>
              <option value="property">Property Law</option>
              <option value="commercial">Commercial Law</option>
              <option value="civil_litigation">Civil Litigation</option>
              <option value="criminal_defense">Criminal Defense</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low ({">"} 4 weeks)</option>
              <option value="medium">Medium (1-4 weeks)</option>
              <option value="high">High (&lt; 1 week)</option>
              <option value="critical">Critical (&lt; 3 days)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complexity *</label>
            <select
              name="complexity"
              value={formData.complexity}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
              <option value="highly_complex">Highly Complex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Matter Value (KES)</label>
          <input
            type="number"
            name="estimated_value"
            value={formData.estimated_value}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 5000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (if any)</label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Description</label>
          <input
            type="text"
            name="deadline_description"
            value={formData.deadline_description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Court hearing date, contract expiry"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {submitting ? 'Analyzing with AI...' : 'Submit Intake'}
          </button>
        </div>
      </form>
    </div>
  )

  const renderStep3 = () => {
    if (!intakeResult) return null

    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Intake Analysis Complete</h2>
            <p className="text-gray-600 mt-1">Intake ID: {intakeResult.intake_id}</p>
          </div>
          {renderPriorityBadge(intakeResult.priority_score)}
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-base font-medium text-gray-900">{intakeResult.ai_category || formData.matter_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Practice Area</p>
              <p className="text-base font-medium text-gray-900">{intakeResult.ai_practice_area || formData.practice_area}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgency</p>
              <div className="mt-1">{renderUrgencyBadge(intakeResult.ai_urgency || formData.urgency)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Complexity</p>
              <p className="text-base font-medium text-gray-900 capitalize">{intakeResult.ai_complexity || formData.complexity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority Score</p>
              <p className="text-2xl font-bold text-blue-600">{intakeResult.priority_score.toFixed(1)}/100</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Confidence</p>
              <p className="text-2xl font-bold text-green-600">{intakeResult.confidence_score?.toFixed(1) || 'N/A'}%</p>
            </div>
          </div>
        </div>

        {/* Recommended Lawyers */}
        {intakeResult.recommended_lawyers && intakeResult.recommended_lawyers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommended Lawyers</h3>
            <div className="space-y-3">
              {intakeResult.recommended_lawyers.map((lawyer: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{lawyer.name}</p>
                      <p className="text-sm text-gray-600">{lawyer.specialization}</p>
                      {lawyer.match_reasons && (
                        <ul className="mt-2 space-y-1">
                          {lawyer.match_reasons.map((reason: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{lawyer.match_score.toFixed(0)}%</div>
                      <p className="text-xs text-gray-500">Match Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {intakeResult.risk_factors && intakeResult.risk_factors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Risk Factors Identified</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="space-y-2">
                {intakeResult.risk_factors.map((risk: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-900 flex items-start">
                    <span className="text-yellow-600 mr-2 mt-0.5">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {intakeResult.ai_recommendations && intakeResult.ai_recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommended Actions</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="space-y-2">
                {intakeResult.ai_recommendations.map((action: string, index: number) => (
                  <li key={index} className="text-sm text-green-900 flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Processing Time */}
        <div className="text-sm text-gray-500 mb-6">
          Processing time: {intakeResult.processing_time_seconds?.toFixed(2) || 'N/A'}s
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
          >
            New Intake
          </button>
          <div className="space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Assign Lawyer
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Single return with conditional rendering
  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </>
  )
}
