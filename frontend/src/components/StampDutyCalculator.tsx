'use client'

import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface StampDutyCalculatorProps {
  apiKey: string
}

interface CalculationResult {
  property_value: number
  stamp_duty_rate: number
  stamp_duty_amount: number
  registration_fee: number
  search_fees: number
  total_government_charges: number
  total_legal_fees: number
  total_cost: number
}

export function StampDutyCalculator({ apiKey }: StampDutyCalculatorProps) {
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CalculationResult | null>(null)

  const [formData, setFormData] = useState({
    property_value: '',
    property_type: 'residential',
    property_location: 'Nairobi',
    is_first_time_buyer: false,
    is_affordable_housing: false,
    requires_cgt: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCalculate = async () => {
    if (!apiKey) {
      setError('API key is required')
      return
    }

    if (!formData.property_value) {
      setError('Property value is required')
      return
    }

    setCalculating(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/conveyancing/calculate-stamp-duty`,
        {
          property_value: parseFloat(formData.property_value),
          property_type: formData.property_type,
          property_location: formData.property_location,
          is_first_time_buyer: formData.is_first_time_buyer,
          is_affordable_housing: formData.is_affordable_housing,
          requires_cgt: formData.requires_cgt
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setResult(response.data)
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to calculate stamp duty')
      }
    } finally {
      setCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Kenya Stamp Duty Calculator</h2>

        {/* Input Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Value (KES) *
            </label>
            <input
              type="number"
              name="property_value"
              value={formData.property_value}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County/Location *
              </label>
              <select
                name="property_location"
                value={formData.property_location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_first_time_buyer"
                checked={formData.is_first_time_buyer}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">First-time buyer</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_affordable_housing"
                checked={formData.is_affordable_housing}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Affordable Housing Scheme (2% stamp duty)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requires_cgt"
                checked={formData.requires_cgt}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Calculate Capital Gains Tax (for seller)
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {calculating ? 'Calculating...' : 'Calculate Stamp Duty'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Calculation Results</h3>

          {/* Summary Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Transaction Cost</p>
              <p className="text-4xl font-bold text-blue-600">
                {formatCurrency(result.total_cost)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                (Excluding purchase price of {formatCurrency(result.property_value)})
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h4>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {/* Stamp Duty */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Stamp Duty</p>
                  <p className="text-xs text-gray-500">
                    {result.stamp_duty_rate}% of property value
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(result.stamp_duty_amount)}
                </p>
              </div>

              {/* Registration Fee */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Registration Fee</p>
                  <p className="text-xs text-gray-500">Land Registry fees</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(result.registration_fee)}
                </p>
              </div>

              {/* Search Fees */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Search Fees</p>
                  <p className="text-xs text-gray-500">Official searches</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(result.search_fees)}
                </p>
              </div>

              {/* Government Charges Subtotal */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Total Government Charges</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(result.total_government_charges)}
                </p>
              </div>

              {/* Legal Fees */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Legal Fees (incl. VAT)</p>
                  <p className="text-xs text-gray-500">Advocate's fees + 16% VAT</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(result.total_legal_fees)}
                </p>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <p className="text-base font-bold text-gray-800">TOTAL COST</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(result.total_cost)}
                </p>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-900 mb-2">Important Notes:</h5>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Stamp duty must be paid within 30 days of execution</li>
              <li>Rates may vary based on specific circumstances</li>
              <li>Additional costs may include rates clearance, land rent, etc.</li>
              <li>Legal fees are estimates based on Law Society of Kenya guidelines</li>
              {formData.is_affordable_housing && (
                <li className="font-semibold">2% stamp duty rate applied for affordable housing</li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              New Calculation
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Generate Quote PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
