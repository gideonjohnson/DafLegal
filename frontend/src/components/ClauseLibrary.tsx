'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Clause {
  clause_id: string;
  title: string;
  category: string;
  text: string;
  description?: string;
  alternate_text?: string;
  tags: string[];
  jurisdiction?: string;
  language: string;
  risk_level: string;
  compliance_notes?: string;
  status: string;
  version: number;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

interface ClauseLibraryProps {
  apiKey: string;
}

export default function ClauseLibrary({ apiKey }: ClauseLibraryProps) {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // New clause form
  const [newClause, setNewClause] = useState({
    title: '',
    category: 'termination',
    text: '',
    description: '',
    tags: [] as string[],
    risk_level: 'neutral'
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const searchClauses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/clauses/search`,
        {
          query: searchQuery || undefined,
          category: categoryFilter || undefined,
          tags: tagFilter ? [tagFilter] : undefined,
          limit: 50,
          offset: 0
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      setClauses(response.data.clauses);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search clauses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchClauses();
  }, [categoryFilter]);

  const handleCreateClause = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/clauses/`,
        newClause,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      setClauses([response.data, ...clauses]);
      setShowCreateForm(false);
      setNewClause({
        title: '',
        category: 'termination',
        text: '',
        description: '',
        tags: [],
        risk_level: 'neutral'
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create clause');
    }
  };

  const handleCopyClause = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Clause copied to clipboard!');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'favorable': return 'text-green-600 bg-green-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'unfavorable': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clause Library</h1>
        <p className="text-gray-600">Store, search, and reuse approved contract clauses</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="termination">Termination</option>
            <option value="indemnification">Indemnification</option>
            <option value="liability">Liability</option>
            <option value="intellectual_property">IP</option>
            <option value="confidentiality">Confidentiality</option>
            <option value="payment">Payment</option>
            <option value="renewal">Renewal</option>
            <option value="force_majeure">Force Majeure</option>
            <option value="dispute_resolution">Dispute Resolution</option>
          </select>

          {/* Tag Filter */}
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={searchClauses}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            {showCreateForm ? 'Cancel' : 'New Clause'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Clause</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newClause.title}
                onChange={(e) => setNewClause({...newClause, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Standard Termination Clause"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newClause.category}
                  onChange={(e) => setNewClause({...newClause, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="termination">Termination</option>
                  <option value="indemnification">Indemnification</option>
                  <option value="liability">Liability</option>
                  <option value="intellectual_property">IP</option>
                  <option value="confidentiality">Confidentiality</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={newClause.risk_level}
                  onChange={(e) => setNewClause({...newClause, risk_level: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="favorable">Favorable</option>
                  <option value="neutral">Neutral</option>
                  <option value="moderate">Moderate</option>
                  <option value="unfavorable">Unfavorable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clause Text
              </label>
              <textarea
                value={newClause.text}
                onChange={(e) => setNewClause({...newClause, text: e.target.value})}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter the clause text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newClause.description}
                onChange={(e) => setNewClause({...newClause, description: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Brief description of when to use this clause..."
              />
            </div>

            <button
              onClick={handleCreateClause}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Clause
            </button>
          </div>
        </div>
      )}

      {/* Clause List */}
      <div className="grid grid-cols-1 gap-4">
        {clauses.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No clauses found. Create your first clause to get started.
          </div>
        )}

        {clauses.map((clause) => (
          <div
            key={clause.clause_id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {clause.title}
                </h3>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {clause.category.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(clause.risk_level)}`}>
                    {clause.risk_level}
                  </span>
                  {clause.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClause(selectedClause?.clause_id === clause.clause_id ? null : clause)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedClause?.clause_id === clause.clause_id ? 'Hide' : 'View'}
                </button>
                <button
                  onClick={() => handleCopyClause(clause.text)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>

            {clause.description && (
              <p className="text-sm text-gray-600 mb-3">{clause.description}</p>
            )}

            {selectedClause?.clause_id === clause.clause_id && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{clause.text}</p>
                {clause.alternate_text && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Alternative Version:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{clause.alternate_text}</p>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Version {clause.version}</span>
                    <span>Used {clause.usage_count} times</span>
                    <span>Created {new Date(clause.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
