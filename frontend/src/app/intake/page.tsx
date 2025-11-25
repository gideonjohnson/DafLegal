'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

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

interface IntakeResult {
  intake_id: string
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

export default function IntakePage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null)

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
            'Authorization': 'Bearer demo-key',
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

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-red-600'
    if (score >= 60) return 'from-orange-500 to-orange-600'
    if (score >= 40) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'Critical Priority'
    if (score >= 60) return 'High Priority'
    if (score >= 40) return 'Medium Priority'
    return 'Low Priority'
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen leather-bg">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
              📋 Client Intake & Triage
            </h1>
            <p className="text-gray-600 text-lg">AI-powered case assessment and lawyer matching</p>
          </div>

          {/* Progress Steps */}
          <div className="glass rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#3D2F28]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="font-semibold hidden md:block">Client Info</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full">
                <div className={`h-full rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#3D2F28]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-semibold hidden md:block">Matter Details</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full">
                <div className={`h-full rounded-full transition-all ${step >= 3 ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#3D2F28]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="font-semibold hidden md:block">AI Analysis</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="glass rounded-2xl p-4 mb-6 bg-red-50 border-2 border-red-300">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {/* Step 1: Client Information */}
          {step === 1 && (
            <div className="glass rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                <span className="text-3xl">👤</span>
                Client Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_existing_client"
                  checked={formData.is_existing_client}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#526450] rounded"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Existing Client
                </label>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.client_name || !formData.client_email}
                className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next: Matter Details →
              </button>
            </div>
          )}

          {/* Step 2: Matter Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                <span className="text-3xl">📑</span>
                Matter Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Matter Title *
                </label>
                <input
                  type="text"
                  name="matter_title"
                  value={formData.matter_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Matter Description *
                </label>
                <textarea
                  name="matter_description"
                  value={formData.matter_description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Practice Area
                  </label>
                  <select
                    name="practice_area"
                    value={formData.practice_area}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  >
                    <option value="general">General</option>
                    <option value="corporate">Corporate Law</option>
                    <option value="litigation">Litigation</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="employment">Employment</option>
                    <option value="family">Family Law</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Complexity
                  </label>
                  <select
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="complex">Complex</option>
                    <option value="very_complex">Very Complex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    name="estimated_value"
                    value={formData.estimated_value}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#526450] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="glass px-8 py-4 rounded-xl font-bold text-lg text-gray-700 hover:bg-white/80 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.matter_title || !formData.matter_description}
                  className="btn-3d flex-1 bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing with AI...
                    </span>
                  ) : (
                    '🤖 Analyze with AI'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: AI Analysis Results */}
          {step === 3 && intakeResult && (
            <div className="space-y-6">
              {/* Priority Score */}
              <div className="glass rounded-3xl p-8 text-center">
                <h2 className="text-2xl font-bold text-[#3D2F28] mb-6">AI Analysis Complete</h2>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div>
                    <div className="text-6xl font-black bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
                      {intakeResult.priority_score}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Priority Score</div>
                  </div>
                  <div>
                    <span className={`px-6 py-3 rounded-full text-lg font-bold text-white bg-gradient-to-r ${getPriorityColor(intakeResult.priority_score)}`}>
                      {getPriorityLabel(intakeResult.priority_score)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  AI Confidence: {intakeResult.confidence_score.toFixed(1)}%
                </div>
              </div>

              {/* Recommended Lawyers */}
              {intakeResult.recommended_lawyers && intakeResult.recommended_lawyers.length > 0 && (
                <div className="glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                    <span className="text-3xl">👨‍⚖️</span>
                    Recommended Lawyers
                  </h3>
                  <div className="space-y-4">
                    {intakeResult.recommended_lawyers.map((lawyer) => (
                      <div key={lawyer.user_id} className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-[#3D2F28]">{lawyer.name}</h4>
                            <p className="text-sm text-gray-600">{lawyer.specialization}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-black text-green-600">{lawyer.match_score}%</div>
                            <div className="text-xs text-gray-500">Match</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {lawyer.match_reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span className="text-sm text-gray-700">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {intakeResult.risk_factors && intakeResult.risk_factors.length > 0 && (
                <div className="glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    Risk Factors
                  </h3>
                  <div className="space-y-3">
                    {intakeResult.risk_factors.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 glass rounded-xl">
                        <span className="text-red-500 text-xl">⚠</span>
                        <span className="text-gray-700">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {intakeResult.ai_recommendations && intakeResult.ai_recommendations.length > 0 && (
                <div className="glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                    <span className="text-3xl">💡</span>
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {intakeResult.ai_recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 glass rounded-xl">
                        <span className="text-blue-500 text-xl">💡</span>
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetForm}
                className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all"
              >
                Start New Intake
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
