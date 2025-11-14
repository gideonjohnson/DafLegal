'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Playbook {
  playbook_id: string;
  name: string;
  description?: string;
  version: string;
  document_type: string;
  jurisdiction?: string;
  tags: string[];
  is_active: boolean;
  is_default: boolean;
  rule_count: int;
  usage_count: number;
  created_at: string;
}

interface Rule {
  rule_id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: string;
  parameters: any;
  is_active: boolean;
  violation_count: number;
  created_at: string;
}

interface CompliancePlaybookProps {
  apiKey: string;
}

export default function CompliancePlaybook({ apiKey }: CompliancePlaybookProps) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);

  const [newPlaybook, setNewPlaybook] = useState({
    name: '',
    description: '',
    document_type: 'general',
    jurisdiction: '',
    tags: [] as string[]
  });

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    rule_type: 'required_clause',
    severity: 'medium',
    parameters: {}
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const loadPlaybooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/compliance/playbooks`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      setPlaybooks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load playbooks');
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async (playbookId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/compliance/playbooks/${playbookId}/rules`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      setRules(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rules');
    }
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  useEffect(() => {
    if (selectedPlaybook) {
      loadRules(selectedPlaybook.playbook_id);
    }
  }, [selectedPlaybook]);

  const handleCreatePlaybook = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/compliance/playbooks`,
        newPlaybook,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      loadPlaybooks();
      setShowCreateForm(false);
      setNewPlaybook({ name: '', description: '', document_type: 'general', jurisdiction: '', tags: [] });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create playbook');
    }
  };

  const handleCreateRule = async () => {
    if (!selectedPlaybook) return;

    try {
      await axios.post(
        `${BASE_URL}/api/v1/compliance/playbooks/${selectedPlaybook.playbook_id}/rules`,
        newRule,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      loadRules(selectedPlaybook.playbook_id);
      setShowRuleForm(false);
      setNewRule({ name: '', description: '', rule_type: 'required_clause', severity: 'medium', parameters: {} });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create rule');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Playbooks</h1>
        <p className="text-gray-600">Define compliance rules and check contracts automatically</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbooks List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Playbooks</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                New
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <input
                  type="text"
                  placeholder="Playbook name"
                  value={newPlaybook.name}
                  onChange={(e) => setNewPlaybook({...newPlaybook, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <textarea
                  placeholder="Description"
                  value={newPlaybook.description}
                  onChange={(e) => setNewPlaybook({...newPlaybook, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded mb-2"
                  rows={2}
                />
                <select
                  value={newPlaybook.document_type}
                  onChange={(e) => setNewPlaybook({...newPlaybook, document_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded mb-2"
                >
                  <option value="general">General</option>
                  <option value="vendor">Vendor</option>
                  <option value="employment">Employment</option>
                  <option value="nda">NDA</option>
                </select>
                <button
                  onClick={handleCreatePlaybook}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Create Playbook
                </button>
              </div>
            )}

            <div className="space-y-2">
              {playbooks.map((playbook) => (
                <div
                  key={playbook.playbook_id}
                  onClick={() => setSelectedPlaybook(playbook)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedPlaybook?.playbook_id === playbook.playbook_id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{playbook.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{playbook.rule_count} rules • Used {playbook.usage_count} times</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="lg:col-span-2">
          {selectedPlaybook ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedPlaybook.name}</h2>
                  <p className="text-sm text-gray-600">{selectedPlaybook.description}</p>
                </div>
                <button
                  onClick={() => setShowRuleForm(!showRuleForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Rule
                </button>
              </div>

              {showRuleForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded border">
                  <h3 className="font-medium mb-3">New Rule</h3>
                  <input
                    type="text"
                    placeholder="Rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded mb-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={newRule.rule_type}
                      onChange={(e) => setNewRule({...newRule, rule_type: e.target.value})}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="required_clause">Required Clause</option>
                      <option value="prohibited_clause">Prohibited Clause</option>
                      <option value="required_term">Required Term</option>
                      <option value="prohibited_term">Prohibited Term</option>
                    </select>
                    <select
                      value={newRule.severity}
                      onChange={(e) => setNewRule({...newRule, severity: e.target.value})}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateRule}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Create Rule
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {rules.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No rules yet. Add your first rule to get started.</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.rule_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{rule.rule_type.replace('_', ' ')}</span>
                        {rule.violation_count > 0 && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                            {rule.violation_count} violations
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">Select a playbook to view and manage its rules</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
