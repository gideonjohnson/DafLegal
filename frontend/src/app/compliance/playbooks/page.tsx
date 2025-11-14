'use client';

import { useState } from 'react';
import CompliancePlaybook from '@/components/CompliancePlaybook';

export default function PlaybooksPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  const handleSubmitApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setHasApiKey(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
      {!hasApiKey ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Compliance Playbooks
            </h2>
            <p className="text-gray-600 mb-6">
              Define compliance rules and automatically check contracts
            </p>
            <form onSubmit={handleSubmitApiKey}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key (dfk_...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Access Playbooks
              </button>
            </form>
          </div>
        </div>
      ) : (
        <CompliancePlaybook apiKey={apiKey} />
      )}
    </main>
  );
}
