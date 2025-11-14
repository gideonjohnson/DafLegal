'use client';

import { useState } from 'react';
import axios from 'axios';

interface Violation {
  rule_id: string;
  rule_name: string;
  severity: string;
  status: string;
  message: string;
  location?: string;
  suggestion?: string;
  auto_fixable: boolean;
}

interface ComplianceResult {
  check_id: string;
  status: string;
  contract_id: string;
  playbook_id: string;
  overall_status: string;
  compliance_score: number;
  rules_checked: number;
  rules_passed: number;
  rules_failed: number;
  rules_warning: number;
  violations: Violation[];
  passed_rules: any[];
  warnings: Violation[];
  executive_summary: string;
  recommendations: string[];
  processing_time_seconds: number;
  created_at: string;
  processed_at: string;
}

interface ComplianceResultsProps {
  apiKey: string;
}

export default function ComplianceResults({ apiKey }: ComplianceResultsProps) {
  const [contractId, setContractId] = useState('');
  const [playbookId, setPlaybookId] = useState('');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const runComplianceCheck = async () => {
    if (!contractId || !playbookId) {
      setError('Please enter both contract ID and playbook ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create check
      const createResponse = await axios.post(
        `${BASE_URL}/api/v1/compliance/checks`,
        { contract_id: contractId, playbook_id: playbookId },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      const checkId = createResponse.data.check_id;

      // Get results (synchronous for now)
      const resultResponse = await axios.get(
        `${BASE_URL}/api/v1/compliance/checks/${checkId}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      setResult(resultResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run compliance check');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial_compliant': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Compliance Check
        </h2>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract ID
            </label>
            <input
              type="text"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="ctr_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playbook ID
            </label>
            <input
              type="text"
              value={playbookId}
              onChange={(e) => setPlaybookId(e.target.value)}
              placeholder="plb_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={runComplianceCheck}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Run Compliance Check'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Compliance Score</h3>
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.compliance_score)}`}>
                  {result.compliance_score.toFixed(1)}%
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(result.overall_status)}`}>
                  {result.overall_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-700">{result.rules_checked}</div>
                  <div className="text-xs text-gray-600">Rules Checked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{result.rules_passed}</div>
                  <div className="text-xs text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{result.rules_failed}</div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{result.rules_warning}</div>
                  <div className="text-xs text-gray-600">Warnings</div>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {result.executive_summary && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Executive Summary</h3>
                <p className="text-gray-700">{result.executive_summary}</p>
              </div>
            )}

            {/* Violations */}
            {result.violations.length > 0 && (
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-sm mr-2">
                    {result.violations.length}
                  </span>
                  Violations Found
                </h3>
                <div className="space-y-3">
                  {result.violations.map((violation, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${getSeverityColor(violation.severity)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{violation.rule_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{violation.message}</p>
                      {violation.suggestion && (
                        <div className="mt-2 p-2 bg-white rounded text-sm">
                          <span className="font-semibold text-gray-700">Suggestion: </span>
                          <span className="text-gray-600">{violation.suggestion}</span>
                        </div>
                      )}
                      {violation.auto_fixable && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Auto-fixable
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h3 className="font-semibold text-gray-800 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Passed Rules */}
            {result.passed_rules.length > 0 && (
              <details className="border border-green-200 rounded-lg p-4">
                <summary className="font-semibold text-gray-800 cursor-pointer">
                  Passed Rules ({result.passed_rules.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {result.passed_rules.map((rule, idx) => (
                    <div key={idx} className="text-sm p-2 bg-green-50 rounded flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{rule.rule_name}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
