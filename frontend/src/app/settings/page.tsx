'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface UserProfile {
  id: number
  email: string
  full_name: string | null
  plan: string
  pages_used_current_period: number
  files_used_current_period: number
  billing_period_start: string
  billing_period_end: string
  created_at: string
}

interface APIKey {
  id: number
  name: string
  key?: string  // Only present when newly created
  key_preview?: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

type TabType = 'profile' | 'security' | 'api-keys'

export default function SettingsPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)

  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // API key form
  const [newKeyName, setNewKeyName] = useState('')
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('apiKey') : null

  useEffect(() => {
    if (!apiKey) {
      router.push('/auth/signin')
      return
    }
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/profile`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFullName(data.full_name || '')
        setEmail(data.email || '')
      } else {
        error('Failed to load profile')
      }
    } catch (err) {
      error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const loadAPIKeys = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/api-keys`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAPIKeys(data)
      }
    } catch (err) {
      error('Failed to load API keys')
    }
  }

  useEffect(() => {
    if (activeTab === 'api-keys' && apiKey) {
      loadAPIKeys()
    }
  }, [activeTab])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        success('Profile updated successfully')
      } else {
        const data = await response.json()
        error(data.detail || 'Failed to update profile')
      }
    } catch (err) {
      error('Error updating profile')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      error('Password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      if (response.ok) {
        success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        error(data.detail || 'Failed to change password')
      }
    } catch (err) {
      error('Error changing password')
    }
  }

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newKeyName.trim()) {
      error('API key name is required')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName })
      })

      if (response.ok) {
        const data = await response.json()
        setNewlyCreatedKey(data.key)
        setNewKeyName('')
        loadAPIKeys()
        success('API key created successfully')
      } else {
        const data = await response.json()
        error(data.detail || 'Failed to create API key')
      }
    } catch (err) {
      error('Error creating API key')
    }
  }

  const handleRevokeAPIKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/settings/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        success('API key revoked successfully')
        loadAPIKeys()
      } else {
        error('Failed to revoke API key')
      }
    } catch (err) {
      error('Error revoking API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#d4a561] text-[#d4a561]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-[#d4a561] text-[#d4a561]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'api-keys'
                    ? 'border-[#d4a561] text-[#d4a561]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                API Keys
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Profile Information
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#d4a561] text-white rounded-lg font-medium hover:bg-[#b8965a] transition-colors"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>

                {/* Account Info */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {profile.plan.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Member since:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Files used:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {profile.files_used_current_period}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Pages processed:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {profile.pages_used_current_period}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Change Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      At least 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#d4a561] text-white rounded-lg font-medium hover:bg-[#b8965a] transition-colors"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                {/* Create New Key */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Create New API Key
                  </h2>
                  <form onSubmit={handleCreateAPIKey} className="flex gap-3 max-w-md">
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="API Key Name (e.g., Production, Development)"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#d4a561] text-white rounded-lg font-medium hover:bg-[#b8965a] transition-colors whitespace-nowrap"
                    >
                      Create Key
                    </button>
                  </form>
                </div>

                {/* Newly Created Key Alert */}
                {newlyCreatedKey && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      ⚠️ Save Your API Key
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                      Make sure to copy your API key now. You won't be able to see it again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {newlyCreatedKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => setNewlyCreatedKey(null)}
                      className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
                    >
                      I've saved my key
                    </button>
                  </div>
                )}

                {/* API Keys List */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Your API Keys ({apiKeys.length}/10)
                  </h2>
                  <div className="space-y-3">
                    {apiKeys.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No API keys yet. Create one above to get started.
                      </p>
                    ) : (
                      apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {key.name}
                              </h3>
                              {key.is_active ? (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 rounded">
                                  Revoked
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                              {key.key_preview}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                Created: {new Date(key.created_at).toLocaleDateString()}
                              </span>
                              {key.last_used_at && (
                                <span>
                                  Last used: {new Date(key.last_used_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {key.is_active && (
                            <button
                              onClick={() => handleRevokeAPIKey(key.id)}
                              className="ml-4 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
