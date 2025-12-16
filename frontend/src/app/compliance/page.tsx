'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAskBar } from '@/hooks/useAskBar'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_KEY = 'dfk_test1234567890123456789012345678901234567890' // Demo key

interface Playbook {
  playbook_id: string
  name: string
  description?: string
  document_type: string
  jurisdiction?: string
  tags: string[]
  is_active: boolean
  rule_count: number
  usage_count: number
  created_at: string
}

interface Rule {
  rule_id: string
  name: string
  description: string
  rule_type: string
  severity: string
  is_active: boolean
  violation_count: number
}

interface ComplianceResult {
  check_id: string
  score: number
  violations: any[]
  warnings: any[]
  passed_rules: number
  total_rules: number
  created_at: string
}

export default function CompliancePage() {
  const { triggerAsk } = useAskBar()
  const [activeTab, setActiveTab] = useState<'playbooks' | 'check'>('check')

  // Playbooks state
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [showCreatePlaybook, setShowCreatePlaybook] = useState(false)
  const [showCreateRule, setShowCreateRule] = useState(false)

  // Check state
  const [checkContract, setCheckContract] = useState('')
  const [checkPlaybookId, setCheckPlaybookId] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<ComplianceResult | null>(null)

  // Form state
  const [newPlaybook, setNewPlaybook] = useState({
    name: '',
    description: '',
    document_type: 'general',
    jurisdiction: 'Kenya',
    tags: ''
  })

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    rule_type: 'required_clause',
    severity: 'medium',
    clause_text: ''
  })

  const [error, setError] = useState('')

  useEffect(() => {
    loadPlaybooks()
  }, [])

  useEffect(() => {
    if (selectedPlaybook) {
      loadRules(selectedPlaybook.playbook_id)
    }
  }, [selectedPlaybook])

  const loadPlaybooks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/compliance/playbooks`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      })
      setPlaybooks(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load playbooks')
    }
  }

  const loadRules = async (playbookId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/compliance/playbooks/${playbookId}/rules`,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      )
      setRules(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rules')
    }
  }

  const handleCreatePlaybook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${BASE_URL}/api/v1/compliance/playbooks`,
        {
          ...newPlaybook,
          tags: newPlaybook.tags.split(',').map(t => t.trim()).filter(t => t)
        },
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      )
      loadPlaybooks()
      setShowCreatePlaybook(false)
      setNewPlaybook({ name: '', description: '', document_type: 'general', jurisdiction: 'Kenya', tags: '' })
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create playbook')
    }
  }

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlaybook) return

    try {
      await axios.post(
        `${BASE_URL}/api/v1/compliance/playbooks/${selectedPlaybook.playbook_id}/rules`,
        {
          ...newRule,
          parameters: { clause_text: newRule.clause_text }
        },
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      )
      loadRules(selectedPlaybook.playbook_id)
      setShowCreateRule(false)
      setNewRule({ name: '', description: '', rule_type: 'required_clause', severity: 'medium', clause_text: '' })
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create rule')
    }
  }

  const handleCheckCompliance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkPlaybookId || !checkContract) return

    setChecking(true)
    setError('')
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/compliance/check`,
        {
          playbook_id: checkPlaybookId,
          contract_text: checkContract
        },
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      )
      setCheckResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to check compliance')
    } finally {
      setChecking(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      case 'high': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      case 'low': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="icon-3d w-16 h-16 bg-gradient-to-br from-[#3D2F28] via-[#5C4A3D] to-[#526450] rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-black">Compliance Checker</h1>
              <p className="text-gray-600 text-lg mt-1">Define playbooks and ensure contract compliance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('check')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'check'
                ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                : 'text-gray-700 hover:bg-white/50'
            }`}
          >
            🔍 Check Contract
          </button>
          <button
            onClick={() => setActiveTab('playbooks')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'playbooks'
                ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                : 'text-gray-700 hover:bg-white/50'
            }`}
          >
            📋 Playbooks
          </button>
        </div>

        {error && (
          <div className="glass border-2 border-red-300 bg-red-50/50 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Check Contract Tab */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Check Contract Compliance</h2>

              <form onSubmit={handleCheckCompliance} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Playbook</label>
                  <select
                    value={checkPlaybookId}
                    onChange={(e) => setCheckPlaybookId(e.target.value)}
                    required
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] focus:ring-2 focus:ring-[#3D2F28]/20 transition-all"
                  >
                    <option value="">Choose a compliance playbook...</option>
                    {playbooks.map((pb) => (
                      <option key={pb.playbook_id} value={pb.playbook_id}>
                        {pb.name} ({pb.rule_count} rules)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contract Text</label>
                  <textarea
                    value={checkContract}
                    onChange={(e) => setCheckContract(e.target.value)}
                    required
                    rows={12}
                    placeholder="Paste your contract text here..."
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] focus:ring-2 focus:ring-[#3D2F28]/20 transition-all font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checking}
                  className="btn-3d w-full bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68] text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition-all"
                >
                  {checking ? '⏳ Checking Compliance...' : '✓ Check Compliance'}
                </button>
              </form>
            </div>

            {/* Results */}
            {checkResult && (
              <div className="glass rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-black">Compliance Results</h2>
                  <div className="text-right">
                    <div className={`text-5xl font-black ${getScoreColor(checkResult.score)}`}>
                      {checkResult.score}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Compliance Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{checkResult.passed_rules}</div>
                    <p className="text-sm text-gray-600 mt-1">Passed Rules</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">{checkResult.violations.length}</div>
                    <p className="text-sm text-gray-600 mt-1">Violations</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{checkResult.warnings.length}</div>
                    <p className="text-sm text-gray-600 mt-1">Warnings</p>
                  </div>
                </div>

                {/* Violations */}
                {checkResult.violations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3 flex items-center">
                      <span className="text-2xl mr-2">❌</span> Violations
                    </h3>
                    <div className="space-y-3">
                      {checkResult.violations.map((v: any, i: number) => (
                        <div key={i} className="bg-red-50/50 border-2 border-red-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-red-900">{v.rule_name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(v.severity)}`}>
                              {v.severity}
                            </span>
                          </div>
                          <p className="text-sm text-red-800">{v.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {checkResult.warnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3 flex items-center">
                      <span className="text-2xl mr-2">⚠️</span> Warnings
                    </h3>
                    <div className="space-y-3">
                      {checkResult.warnings.map((w: any, i: number) => (
                        <div key={i} className="bg-yellow-50/50 border-2 border-yellow-200 rounded-xl p-4">
                          <h4 className="font-bold text-yellow-900 mb-1">{w.rule_name}</h4>
                          <p className="text-sm text-yellow-800">{w.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Playbooks Tab */}
        {activeTab === 'playbooks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playbooks List */}
            <div className="lg:col-span-1">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Playbooks</h2>
                  <button
                    onClick={() => setShowCreatePlaybook(true)}
                    className="btn-3d bg-gradient-to-r from-[#526450] to-[#6B7A68] text-white px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    + New
                  </button>
                </div>

                <div className="space-y-2">
                  {playbooks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">📋</p>
                      <p className="text-sm">No playbooks yet</p>
                    </div>
                  ) : (
                    playbooks.map((pb) => (
                      <div
                        key={pb.playbook_id}
                        onClick={() => setSelectedPlaybook(pb)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedPlaybook?.playbook_id === pb.playbook_id
                            ? 'bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                            : 'glass hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold">{pb.name}</h3>
                          {pb.is_active && <span className="text-xs">✓</span>}
                        </div>
                        <p className={`text-xs ${selectedPlaybook?.playbook_id === pb.playbook_id ? 'text-white/80' : 'text-gray-600'}`}>
                          {pb.rule_count} rules • {pb.usage_count} checks
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Rules for Selected Playbook */}
            <div className="lg:col-span-2">
              {selectedPlaybook ? (
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black">{selectedPlaybook.name}</h2>
                      <p className="text-gray-600">{selectedPlaybook.description}</p>
                    </div>
                    <button
                      onClick={() => setShowCreateRule(true)}
                      className="btn-3d bg-gradient-to-r from-[#526450] to-[#6B7A68] text-white px-4 py-2 rounded-xl font-bold"
                    >
                      + Add Rule
                    </button>
                  </div>

                  <div className="space-y-3">
                    {rules.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-3xl mb-2">📜</p>
                        <p>No rules defined yet</p>
                        <p className="text-sm mt-1">Click "Add Rule" to create your first compliance rule</p>
                      </div>
                    ) : (
                      rules.map((rule) => (
                        <div key={rule.rule_id} className="glass rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-black">{rule.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ml-4 ${getSeverityColor(rule.severity)}`}>
                              {rule.severity}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>Type: {rule.rule_type}</span>
                            <span>•</span>
                            <span>Violations: {rule.violation_count}</span>
                            <span>•</span>
                            <span className={rule.is_active ? 'text-green-600' : 'text-gray-400'}>
                              {rule.is_active ? '✓ Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass rounded-3xl p-12 text-center">
                  <p className="text-6xl mb-4">📋</p>
                  <p className="text-xl font-bold text-gray-700 mb-2">Select a Playbook</p>
                  <p className="text-gray-500">Choose a playbook from the list to view its rules</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Playbook Modal */}
        {showCreatePlaybook && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreatePlaybook(false)}>
            <div className="glass rounded-3xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-black mb-6">Create New Playbook</h2>

              <form onSubmit={handleCreatePlaybook} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Playbook Name *</label>
                  <input
                    type="text"
                    value={newPlaybook.name}
                    onChange={(e) => setNewPlaybook({ ...newPlaybook, name: e.target.value })}
                    required
                    placeholder="e.g., Kenya Employment Contracts"
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newPlaybook.description}
                    onChange={(e) => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the purpose of this playbook..."
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                    <select
                      value={newPlaybook.document_type}
                      onChange={(e) => setNewPlaybook({ ...newPlaybook, document_type: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                    >
                      <option value="general">General</option>
                      <option value="employment">Employment</option>
                      <option value="nda">NDA</option>
                      <option value="service">Service Agreement</option>
                      <option value="lease">Lease</option>
                      <option value="sale">Sale Agreement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Jurisdiction</label>
                    <input
                      type="text"
                      value={newPlaybook.jurisdiction}
                      onChange={(e) => setNewPlaybook({ ...newPlaybook, jurisdiction: e.target.value })}
                      placeholder="e.g., Kenya"
                      className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newPlaybook.tags}
                    onChange={(e) => setNewPlaybook({ ...newPlaybook, tags: e.target.value })}
                    placeholder="e.g., employment, kenya, standard"
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaybook(false)}
                    className="flex-1 px-6 py-3 glass rounded-xl font-bold text-gray-700 hover:bg-white/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Create Playbook
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {showCreateRule && selectedPlaybook && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreateRule(false)}>
            <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-black mb-6">Add Compliance Rule</h2>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rule Name *</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    required
                    placeholder="e.g., Termination Clause Required"
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    required
                    rows={3}
                    placeholder="Describe what this rule checks for..."
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rule Type</label>
                    <select
                      value={newRule.rule_type}
                      onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                    >
                      <option value="required_clause">Required Clause</option>
                      <option value="prohibited_clause">Prohibited Clause</option>
                      <option value="keyword_check">Keyword Check</option>
                      <option value="length_check">Length Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Severity</label>
                    <select
                      value={newRule.severity}
                      onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                      className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Clause Text / Keyword</label>
                  <textarea
                    value={newRule.clause_text}
                    onChange={(e) => setNewRule({ ...newRule, clause_text: e.target.value })}
                    rows={4}
                    placeholder="Enter the required clause text or keyword to check for..."
                    className="w-full px-4 py-3 glass rounded-xl border-2 border-[#8B7355]/20 focus:border-[#3D2F28] transition-all font-mono text-sm"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateRule(false)}
                    className="flex-1 px-6 py-3 glass rounded-xl font-bold text-gray-700 hover:bg-white/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Add Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
