// Admin panel for viewing and managing A/B tests

'use client'

import { useState, useEffect } from 'react'
import { getExperiments, getAllAssignments, clearAllAssignments, type ExperimentAssignment } from '@/lib/ab-testing'

export function ABTestAdmin() {
  const [assignments, setAssignments] = useState<ExperimentAssignment[]>([])
  const experiments = getExperiments()

  useEffect(() => {
    setAssignments(getAllAssignments())
  }, [])

  const handleClearAssignments = () => {
    if (confirm('Clear all A/B test assignments? This will reassign you to new variants.')) {
      clearAllAssignments()
      setAssignments([])
      // Reload page to get new assignments
      window.location.reload()
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">A/B Test Admin</h2>
        <button
          onClick={handleClearAssignments}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Clear All Assignments
        </button>
      </div>

      {/* Active Experiments */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Active Experiments</h3>
        <div className="space-y-4">
          {experiments.map((experiment) => {
            const assignment = assignments.find((a) => a.experimentId === experiment.id)

            return (
              <div
                key={experiment.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">{experiment.name}</h4>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      experiment.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {experiment.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">ID: {experiment.id}</p>

                {/* Variants */}
                <div className="mb-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Variants:</p>
                  {experiment.variants.map((variant) => {
                    const isAssigned = assignment?.variantId === variant.id

                    return (
                      <div
                        key={variant.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-sm ${
                          isAssigned
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <span className="text-gray-900 dark:text-white">
                          {variant.name}
                          {isAssigned && (
                            <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                              (Current)
                            </span>
                          )}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(variant.weight * 100)}%
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Assignment Info */}
                {assignment && (
                  <div className="rounded-lg bg-white p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Assignments */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Your Current Assignments
        </h3>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No assignments yet. Visit pages with A/B tests to get assigned to variants.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Experiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Assigned At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {assignments.map((assignment) => {
                  const experiment = experiments.find((e) => e.id === assignment.experimentId)
                  const variant = experiment?.variants.find((v) => v.id === assignment.variantId)

                  return (
                    <tr key={assignment.experimentId}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {experiment?.name || assignment.experimentId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {variant?.name || assignment.variantId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(assignment.assignedAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-200">How to use:</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Visit pages with A/B tests to get automatically assigned to variants</li>
          <li>Your assignments are stored in localStorage and persist across sessions</li>
          <li>Click "Clear All Assignments" to reset and try different variants</li>
          <li>Conversion events are tracked and sent to Google Analytics</li>
        </ul>
      </div>
    </div>
  )
}
