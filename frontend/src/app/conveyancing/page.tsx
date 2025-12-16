"use client"
import Image from 'next/image'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

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

interface Statistics {
  total_transactions: number
  active_transactions: number
  completed_transactions: number
  total_property_value: number
  by_transaction_type: Record<string, number>
  by_status: Record<string, number>
}

export default function ConveyancingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchStatistics()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/v1/conveyancing/transactions`, {
        headers: { 'Authorization': 'Bearer demo-key' },
        params: { limit: 50 }
      })
      setTransactions(response.data)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/conveyancing/statistics/summary`, {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      setStatistics(response.data)
    } catch (err) {
      console.error('Failed to fetch statistics')
    }
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

  const getTransactionTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'purchase': '🏠',
      'sale': '💰',
      'transfer': '🔄',
      'lease': '📋',
      'mortgage': '🏦',
      'refinance': '💳'
    }
    return icons[type] || '📄'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      instruction: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      due_diligence: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      drafting: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      approval: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      execution: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      payment: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      registration: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
      completion: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      on_hold: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
    }
    return colors[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'from-green-500 to-green-600'
    if (percentage >= 50) return 'from-blue-500 to-blue-600'
    if (percentage >= 25) return 'from-yellow-500 to-yellow-600'
    return 'from-orange-500 to-orange-600'
  }

  const filteredTransactions = activeFilter === 'all'
    ? transactions
    : transactions.filter(t => t.status === activeFilter)

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
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent mb-2">
            🏡 Conveyancing Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage property transactions in Kenya</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📊</span>
                <span className="icon-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                  {statistics.total_transactions}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Transactions</h3>
              <p className="text-2xl font-bold text-[#3D2F28]">{statistics.total_transactions}</p>
            </div>

            <div className="glass rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⚡</span>
                <span className="icon-3d bg-gradient-to-r from-blue-500 to-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                  {statistics.active_transactions}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Active</h3>
              <p className="text-2xl font-bold text-blue-600">{statistics.active_transactions}</p>
            </div>

            <div className="glass rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">✅</span>
                <span className="icon-3d bg-gradient-to-r from-green-500 to-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                  {statistics.completed_transactions}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{statistics.completed_transactions}</p>
            </div>

            <div className="glass rounded-3xl p-6 hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Value</h3>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(statistics.total_property_value)}</p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Filters */}
          <div className="glass rounded-2xl p-2 inline-flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeFilter === 'all'
                  ? 'btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white'
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('due_diligence')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeFilter === 'due_diligence'
                  ? 'btn-3d bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              Due Diligence
            </button>
            <button
              onClick={() => setActiveFilter('drafting')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeFilter === 'drafting'
                  ? 'btn-3d bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              Drafting
            </button>
            <button
              onClick={() => setActiveFilter('completion')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeFilter === 'completion'
                  ? 'btn-3d bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'text-gray-700 hover:bg-white/30'
              }`}
            >
              Completed
            </button>
          </div>

          {/* New Transaction Button */}
          <button
            onClick={() => setShowNewForm(true)}
            className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
          >
            ✨ New Transaction
          </button>
        </div>

        {/* Transactions Grid */}
        {loading ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#526450]"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-[#3D2F28] mb-2">No transactions found</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'all'
                ? 'Create your first property transaction to get started'
                : `No transactions with status: ${activeFilter.replace('_', ' ')}`
              }
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              ✨ Create Transaction
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTransactions.map((transaction) => {
              const daysUntil = getDaysUntil(transaction.target_completion_date)

              return (
                <div key={transaction.transaction_id} className="glass rounded-3xl p-6 hover:shadow-2xl transition-all group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{getTransactionTypeIcon(transaction.transaction_type)}</span>
                      <div>
                        <h3 className="font-bold text-[#3D2F28] mb-1 group-hover:text-[#526450] transition-colors">
                          {transaction.transaction_title}
                        </h3>
                        <p className="text-xs text-gray-500">ID: {transaction.transaction_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                      {transaction.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-2 mb-4 bg-white/50 rounded-xl p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold text-[#3D2F28] capitalize">{transaction.transaction_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-semibold text-[#3D2F28] capitalize">{transaction.client_role}</span>
                    </div>
                    {transaction.purchase_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-semibold text-purple-600">{formatCurrency(transaction.purchase_price)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                      <span>Progress</span>
                      <span>{transaction.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 bg-gradient-to-r ${getProgressColor(transaction.progress_percentage)} transition-all rounded-full`}
                        style={{ width: `${transaction.progress_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 capitalize">
                      Stage: <span className="font-semibold">{transaction.current_stage.replace('_', ' ')}</span>
                    </p>
                  </div>

                  {/* Due Diligence */}
                  <div className="bg-gradient-to-r from-[#6B7A68]/10 to-[#526450]/10 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-[#3D2F28] mb-2">🔍 Due Diligence</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Searches:</span>
                      <span className="font-semibold text-[#3D2F28]">
                        {transaction.searches_completed}/{transaction.searches_total}
                      </span>
                    </div>
                    {transaction.issues_identified > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">⚠️ Issues:</span>
                        <span className="font-bold text-red-600">{transaction.issues_identified}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {daysUntil !== null && (
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-600">📅 Target:</span>
                      <span className={`font-bold ${
                        daysUntil < 0 ? 'text-red-600' : daysUntil < 30 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {daysUntil > 0 ? `${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-all">
                      👁️ View
                    </button>
                    <button className="btn-3d bg-white text-[#3D2F28] px-4 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-all">
                      ✏️ Update
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Transaction Type Distribution */}
        {statistics && statistics.by_transaction_type && (
          <div className="glass rounded-3xl p-6 mb-8">
            <h3 className="text-xl font-bold text-[#3D2F28] mb-6 flex items-center gap-2">
              📊 Transactions by Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.by_transaction_type).map(([type, count]: [string, any]) => (
                <div key={type} className="bg-white/70 rounded-xl p-4 hover:bg-white transition-all">
                  <div className="text-3xl mb-2">{getTransactionTypeIcon(type)}</div>
                  <p className="text-sm text-gray-600 capitalize mb-1">{type}</p>
                  <p className="text-3xl font-bold text-[#3D2F28]">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowCalculator(true)}
            className="glass rounded-3xl p-6 text-left hover:shadow-2xl transition-all group"
          >
            <div className="icon-3d bg-gradient-to-r from-blue-500 to-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-all">
              🧮
            </div>
            <h4 className="font-bold text-[#3D2F28] text-lg mb-2">Stamp Duty Calculator</h4>
            <p className="text-sm text-gray-600">Calculate costs for property transactions in Kenya</p>
          </button>

          <button className="glass rounded-3xl p-6 text-left hover:shadow-2xl transition-all group">
            <div className="icon-3d bg-gradient-to-r from-green-500 to-green-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-all">
              📄
            </div>
            <h4 className="font-bold text-[#3D2F28] text-lg mb-2">Generate Documents</h4>
            <p className="text-sm text-gray-600">Create sale agreements, transfers, and more</p>
          </button>

          <button className="glass rounded-3xl p-6 text-left hover:shadow-2xl transition-all group">
            <div className="icon-3d bg-gradient-to-r from-purple-500 to-purple-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-all">
              ✓
            </div>
            <h4 className="font-bold text-[#3D2F28] text-lg mb-2">Due Diligence Checklist</h4>
            <p className="text-sm text-gray-600">Track searches and compliance items</p>
          </button>
        </div>

        {/* New Transaction Modal */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#3D2F28]">✨ New Transaction</h2>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-6">Create a new property transaction</p>
              <div className="text-center py-12">
                <p className="text-gray-600">New transaction form coming soon...</p>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="mt-6 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stamp Duty Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#3D2F28]">🧮 Stamp Duty Calculator</h2>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-6">Calculate stamp duty and transfer costs for Kenya</p>
              <div className="text-center py-12">
                <p className="text-gray-600">Stamp duty calculator coming soon...</p>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="mt-6 btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
