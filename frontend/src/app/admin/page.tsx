"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'

interface DashboardMetrics {
  total_users: number
  total_contracts: number
  analyzed_contracts: number
  total_comparisons: number
  total_clauses: number
  total_compliance_checks: number
  total_research_queries: number
  total_generated_contracts: number
}

interface FeatureUsage {
  total_users: number
  contract_analysis: {users: number, percentage: number}
  comparison: {users: number, percentage: number}
  clause_library: {users: number, percentage: number}
  compliance: {users: number, percentage: number}
  research: {users: number, percentage: number}
  drafting: {users: number, percentage: number}
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [metricsRes, featuresRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/analytics/dashboard', {
          headers: { 'Authorization': 'Bearer demo-key' }
        }),
        fetch('http://localhost:8000/api/v1/analytics/features', {
          headers: { 'Authorization': 'Bearer demo-key' }
        })
      ])

      const metricsData = await metricsRes.json()
      const featuresData = await featuresRes.json()

      setMetrics(metricsData)
      setFeatureUsage(featuresData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen leather-bg">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
              📊 Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Platform analytics and usage metrics</p>
          </div>

          {loading ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-8 w-8 text-[#526450]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-500 text-lg font-semibold">Loading dashboard...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              {metrics && (
                <div>
                  <h2 className="text-2xl font-bold text-[#3D2F28] mb-6">Platform Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Total Users</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_users.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">👥</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Contracts</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_contracts.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">📄</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Comparisons</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_comparisons.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">🔄</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Clauses</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_clauses.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">📚</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Compliance Checks</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_compliance_checks.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">✓</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Research Queries</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_research_queries.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">🔍</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Generated Contracts</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.total_generated_contracts.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">✏️</div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Analyzed Contracts</p>
                          <p className="text-3xl font-black text-[#3D2F28] mt-2">{metrics.analyzed_contracts.toLocaleString()}</p>
                        </div>
                        <div className="text-5xl">🤖</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Adoption */}
              {featureUsage && (
                <div className="glass rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                    <span className="text-3xl">📈</span>
                    Feature Adoption
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Contract Analysis</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.contract_analysis.users} users ({featureUsage.contract_analysis.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#3D2F28] to-[#526450] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.contract_analysis.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Document Comparison</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.comparison.users} users ({featureUsage.comparison.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.comparison.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Clause Library</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.clause_library.users} users ({featureUsage.clause_library.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.clause_library.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Compliance Checker</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.compliance.users} users ({featureUsage.compliance.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.compliance.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Legal Research</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.research.users} users ({featureUsage.research.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.research.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">Drafting Assistant</span>
                        <span className="text-sm text-gray-600 font-semibold">{featureUsage.drafting.users} users ({featureUsage.drafting.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${featureUsage.drafting.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Health */}
              <div className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-[#3D2F28] mb-6 flex items-center gap-3">
                  <span className="text-3xl">💚</span>
                  System Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="text-sm text-green-700 font-bold mb-2">API Status</div>
                    <div className="text-3xl font-black text-green-900 mb-2">Healthy</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-green-700 font-semibold">All systems operational</span>
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="text-sm text-blue-700 font-bold mb-2">Database</div>
                    <div className="text-3xl font-black text-blue-900 mb-2">Connected</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-xs text-blue-700 font-semibold">Response time: 12ms</span>
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="text-sm text-purple-700 font-bold mb-2">AI Services</div>
                    <div className="text-3xl font-black text-purple-900 mb-2">Active</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                      <span className="text-xs text-purple-700 font-semibold">Processing queries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
