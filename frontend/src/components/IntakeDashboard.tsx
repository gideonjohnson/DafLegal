'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface IntakeDashboardProps {
  apiKey: string
}

interface Intake {
  id: number
  intake_id: string
  client_name: string
  client_email: string
  matter_title: string
  matter_type: string
  practice_area: string
  urgency: string
  complexity: string
  priority_score: number
  status: string
  ai_category: string | null
  confidence_score: number | null
  assigned_to: number | null
  created_at: string
}

export function IntakeDashboard({ apiKey }: IntakeDashboardProps) {
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all')
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    if (apiKey) {
      fetchIntakes()
      fetchStatistics()
    }
  }, [apiKey, selectedStatus, selectedUrgency])

  const fetchIntakes = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: any = { limit: 50 }
      if (selectedStatus !== 'all') params.status = selectedStatus
      if (selectedUrgency !== 'all') params.urgency = selectedUrgency

      const response = await axios.get(`${API_URL}/api/v1/intake/list`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params
      })

      setIntakes(response.data.intakes)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch intakes')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/intake/statistics/summary`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      setStatistics(response.data)
    } catch (err) {
      console.error('Failed to fetch statistics')
    }
  }

  const renderPriorityBadge = (score: number) => {
    if (score >= 80) return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Critical</span>
    if (score >= 60) return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">High</span>
    if (score >= 40) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Medium</span>
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Low</span>
  }

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      categorized: 'bg-purple-100 text-purple-800',
      assigned: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return <span className={`px-2 py-1 ${colors[status]} rounded text-xs font-medium capitalize`}>{status}</span>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Intake Dashboard</h1>
        <p className="text-gray-600">Manage and assign client intakes</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Intakes</p>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_intakes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{statistics.pending_intakes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Assigned</p>
            <p className="text-3xl font-bold text-green-600">{statistics.assigned_intakes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.completed_intakes}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="categorized">Categorized</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchIntakes}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Intakes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading intakes...</p>
          </div>
        ) : intakes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No intakes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intakes.map((intake) => (
                  <tr key={intake.intake_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{intake.client_name}</div>
                      <div className="text-sm text-gray-500">{intake.client_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{intake.matter_title}</div>
                      <div className="text-xs text-gray-500 capitalize">{intake.practice_area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{intake.matter_type.replace('_', ' ')}</div>
                      {intake.ai_category && intake.ai_category !== intake.matter_type && (
                        <div className="text-xs text-blue-600">AI: {intake.ai_category}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPriorityBadge(intake.priority_score)}
                      <div className="text-xs text-gray-500 mt-1">{intake.priority_score.toFixed(0)}/100</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(intake.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(intake.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      {intake.status === 'categorized' && (
                        <button className="text-green-600 hover:text-green-900">Assign</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Matter Type Distribution (if statistics available) */}
      {statistics && statistics.by_matter_type && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Intake Distribution by Matter Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.by_matter_type).map(([type, count]: [string, any]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
