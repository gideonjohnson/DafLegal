'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ConveyancingDashboardProps {
  apiKey: string
}

interface Transaction {
  id: number
  transaction_id: string
  transaction_type: string
  transaction_title: string
  client_role: string
  purchase_price: number | null
  status: string
  current_stage: string
  progress_percentage: number
  target_completion_date: string | null
  created_at: string
  due_diligence_status: string
  searches_completed: number
  searches_total: number
  issues_identified: number
}

export function ConveyancingDashboard({ apiKey }: ConveyancingDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    if (apiKey) {
      fetchTransactions()
      fetchStatistics()
    }
  }, [apiKey])

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_URL}/api/v1/conveyancing/transactions`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params: { limit: 50 }
      })

      setTransactions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/conveyancing/statistics/summary`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      setStatistics(response.data)
    } catch (err) {
      console.error('Failed to fetch statistics')
    }
  }

  const renderProgressBar = (percentage: number) => {
    const color = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
      </div>
    )
  }

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      instruction: 'bg-blue-100 text-blue-800',
      due_diligence: 'bg-purple-100 text-purple-800',
      drafting: 'bg-yellow-100 text-yellow-800',
      approval: 'bg-orange-100 text-orange-800',
      execution: 'bg-pink-100 text-pink-800',
      payment: 'bg-indigo-100 text-indigo-800',
      registration: 'bg-teal-100 text-teal-800',
      completion: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 ${colors[status]} rounded text-xs font-medium capitalize`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getDaysUntil = (dateString: string | null) => {
    if (!dateString) return null
    const target = new Date(dateString)
    const today = new Date()
    const days = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conveyancing Dashboard</h1>
          <p className="text-gray-600">Manage property transactions</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + New Transaction
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{statistics.total_transactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.active_transactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{statistics.completed_transactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(statistics.total_property_value)}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Transactions Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No transactions yet</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Transaction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction) => {
            const daysUntil = getDaysUntil(transaction.target_completion_date)

            return (
              <div key={transaction.transaction_id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{transaction.transaction_title}</h3>
                    <p className="text-xs text-gray-500">ID: {transaction.transaction_id}</p>
                  </div>
                  {renderStatusBadge(transaction.status)}
                </div>

                {/* Transaction Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{transaction.transaction_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{transaction.client_role}</span>
                  </div>
                  {transaction.purchase_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">{formatCurrency(transaction.purchase_price)}</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{transaction.progress_percentage}%</span>
                  </div>
                  {renderProgressBar(transaction.progress_percentage)}
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Stage: {transaction.current_stage.replace('_', ' ')}
                  </p>
                </div>

                {/* Due Diligence Status */}
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Due Diligence</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Searches:</span>
                    <span className="font-medium">{transaction.searches_completed}/{transaction.searches_total}</span>
                  </div>
                  {transaction.issues_identified > 0 && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-600">Issues:</span>
                      <span className="font-medium text-red-600">{transaction.issues_identified}</span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                {daysUntil !== null && (
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-gray-600">Target completion:</span>
                    <span className={`font-medium ${daysUntil < 30 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {daysUntil > 0 ? `${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                    Update
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transaction Type Distribution */}
      {statistics && statistics.by_transaction_type && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transactions by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.by_transaction_type).map(([type, count]: [string, any]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 capitalize">{type}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition">
          <div className="text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Stamp Duty Calculator</h4>
          <p className="text-sm text-gray-600">Calculate costs for property transactions</p>
        </button>

        <button className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition">
          <div className="text-green-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Generate Documents</h4>
          <p className="text-sm text-gray-600">Create sale agreements, transfers, etc.</p>
        </button>

        <button className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition">
          <div className="text-purple-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Due Diligence Checklist</h4>
          <p className="text-sm text-gray-600">Track searches and compliance items</p>
        </button>
      </div>
    </div>
  )
}
