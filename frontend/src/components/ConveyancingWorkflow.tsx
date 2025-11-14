'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ConveyancingWorkflowProps {
  apiKey: string
  transactionId: string
}

interface Milestone {
  id: number
  milestone_id: string
  name: string
  description: string
  stage: string
  sequence_order: number
  status: string
  is_critical: boolean
  target_date: string | null
  completed_at: string | null
  progress_percentage: number
  notes: string | null
}

interface WorkflowProgress {
  transaction_id: string
  status: string
  current_stage: string
  progress_percentage: number
  stages: Array<{
    stage: string
    name: string
    status: string
  }>
  milestones_completed: number
  milestones_total: number
  milestones_overdue: number
  pending_tasks: string[]
  critical_issues: number
  days_to_completion: number | null
}

export function ConveyancingWorkflow({ apiKey, transactionId }: ConveyancingWorkflowProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  useEffect(() => {
    if (apiKey && transactionId) {
      fetchMilestones()
    }
  }, [apiKey, transactionId])

  const fetchMilestones = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `${API_URL}/api/v1/conveyancing/transactions/${transactionId}/milestones`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        }
      )

      setMilestones(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch milestones')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600'
      case 'in_progress': return 'bg-blue-500 border-blue-600'
      case 'pending': return 'bg-gray-300 border-gray-400'
      case 'blocked': return 'bg-red-500 border-red-600'
      case 'skipped': return 'bg-yellow-500 border-yellow-600'
      default: return 'bg-gray-300 border-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'blocked':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        )
      default:
        return <div className="w-2 h-2 bg-white rounded-full"></div>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading workflow...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Conveyancing Workflow</h2>

        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100
                    }%`
                  }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100)}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Milestones</p>
            <p className="text-2xl font-bold text-gray-900">
              {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Current Stage</p>
            <p className="text-lg font-semibold text-blue-600 capitalize">
              {milestones.find(m => m.status === 'in_progress')?.stage.replace('_', ' ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Kenya Conveyancing Stages</h3>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Milestones */}
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.milestone_id} className="relative flex items-start">
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 ${getStatusColor(milestone.status)} flex items-center justify-center z-10 shadow-lg`}>
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content */}
                <div className="ml-8 flex-1">
                  <div
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                      selectedMilestone?.milestone_id === milestone.milestone_id ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedMilestone(
                      selectedMilestone?.milestone_id === milestone.milestone_id ? null : milestone
                    )}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      {milestone.is_critical && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          Critical
                        </span>
                      )}
                    </div>

                    {/* Status and Progress */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="capitalize font-medium">{milestone.status.replace('_', ' ')}</span>
                      {milestone.progress_percentage > 0 && (
                        <span>{milestone.progress_percentage}% complete</span>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex gap-6 text-xs text-gray-500">
                      {milestone.target_date && (
                        <div>
                          <span className="font-medium">Target:</span> {formatDate(milestone.target_date)}
                        </div>
                      )}
                      {milestone.completed_at && (
                        <div>
                          <span className="font-medium">Completed:</span> {formatDate(milestone.completed_at)}
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedMilestone?.milestone_id === milestone.milestone_id && milestone.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{milestone.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage Number */}
                <div className="ml-4 flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">{milestone.sequence_order}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Descriptions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Kenya Conveyancing Process</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">1. Instruction (1 day)</p>
            <p className="text-xs">Retainer, collect documents</p>
          </div>
          <div>
            <p className="font-medium">2. Due Diligence (14 days)</p>
            <p className="text-xs">Searches, verification, inspection</p>
          </div>
          <div>
            <p className="font-medium">3. Drafting (7 days)</p>
            <p className="text-xs">Sale Agreement, Transfer CR11</p>
          </div>
          <div>
            <p className="font-medium">4. Approvals (30 days)</p>
            <p className="text-xs">Land Control, consents</p>
          </div>
          <div>
            <p className="font-medium">5. Execution (3 days)</p>
            <p className="text-xs">Sign documents, pay deposit</p>
          </div>
          <div>
            <p className="font-medium">6. Payment (2 days)</p>
            <p className="text-xs">Stamp duty, CGT, clearances</p>
          </div>
          <div>
            <p className="font-medium">7. Registration (60 days)</p>
            <p className="text-xs">Lodge at Land Registry</p>
          </div>
          <div>
            <p className="font-medium">8. Completion (1 day)</p>
            <p className="text-xs">Handover, close matter</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          <strong>Total Duration:</strong> Approximately 118 days (~4 months)
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={fetchMilestones}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Refresh
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Update Stage
        </button>
      </div>
    </div>
  )
}
