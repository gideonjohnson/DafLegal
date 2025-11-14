"use client"

import { useState, useEffect } from 'react'

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

export default function AdminDashboard() {
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
        fetch('/api/v1/analytics/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
        }),
        fetch('/api/v1/analytics/features', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">Platform analytics and usage metrics</p>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={metrics.total_users} icon="👥" />
          <MetricCard title="Contracts" value={metrics.total_contracts} icon="📄" />
          <MetricCard title="Comparisons" value={metrics.total_comparisons} icon="🔄" />
          <MetricCard title="Clauses" value={metrics.total_clauses} icon="📚" />
          <MetricCard title="Compliance Checks" value={metrics.total_compliance_checks} icon="✓" />
          <MetricCard title="Research Queries" value={metrics.total_research_queries} icon="🔍" />
          <MetricCard title="Generated Contracts" value={metrics.total_generated_contracts} icon="✏️" />
          <MetricCard title="Analyzed Contracts" value={metrics.analyzed_contracts} icon="🤖" />
        </div>
      )}

      {/* Feature Adoption */}
      {featureUsage && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Adoption</h3>
          <div className="space-y-4">
            <FeatureBar
              name="Contract Analysis"
              users={featureUsage.contract_analysis.users}
              percentage={featureUsage.contract_analysis.percentage}
            />
            <FeatureBar
              name="Document Comparison"
              users={featureUsage.comparison.users}
              percentage={featureUsage.comparison.percentage}
            />
            <FeatureBar
              name="Clause Library"
              users={featureUsage.clause_library.users}
              percentage={featureUsage.clause_library.percentage}
            />
            <FeatureBar
              name="Compliance Checker"
              users={featureUsage.compliance.users}
              percentage={featureUsage.compliance.percentage}
            />
            <FeatureBar
              name="Legal Research"
              users={featureUsage.research.users}
              percentage={featureUsage.research.percentage}
            />
            <FeatureBar
              name="Drafting Assistant"
              users={featureUsage.drafting.users}
              percentage={featureUsage.drafting.percentage}
            />
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700 font-medium">API Status</div>
            <div className="text-2xl font-bold text-green-900 mt-2">Healthy</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700 font-medium">Database</div>
            <div className="text-2xl font-bold text-blue-900 mt-2">Connected</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-700 font-medium">AI Services</div>
            <div className="text-2xl font-bold text-purple-900 mt-2">Active</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string, value: number, icon: string }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

function FeatureBar({ name, users, percentage }: { name: string, users: number, percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className="text-sm text-gray-600">{users} users ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
