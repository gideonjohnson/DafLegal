'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface ExportButtonProps {
  exportType: 'pdf' | 'docx' | 'csv'
  endpoint: string
  filename: string
  label?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  disabled?: boolean
  className?: string
}

export function ExportButton({
  exportType,
  endpoint,
  filename,
  label,
  variant = 'outline',
  size = 'md',
  icon = true,
  disabled = false,
  className = ''
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const { success, error: showError } = useToast()

  const handleExport = async () => {
    setExporting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const apiKey = localStorage.getItem('apiKey') // Or get from auth context

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      success(`${exportType.toUpperCase()} exported successfully!`, 'Export Complete')
    } catch (err) {
      console.error('Export error:', err)
      showError(`Failed to export ${exportType.toUpperCase()}. Please try again.`, 'Export Failed')
    } finally {
      setExporting(false)
    }
  }

  const getIcon = () => {
    switch (exportType) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'docx':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'csv':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  const baseClasses = "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    primary: 'bg-[#d4a561] text-white hover:bg-[#b8965a] shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
    outline: 'border-2 border-[#d4a561] text-[#d4a561] hover:bg-[#d4a561] hover:text-white'
  }

  const defaultLabel = `Export ${exportType.toUpperCase()}`

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {exporting ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          {icon && getIcon()}
          <span>{label || defaultLabel}</span>
        </>
      )}
    </button>
  )
}

// Convenience wrapper components
export function ExportPDFButton(props: Omit<ExportButtonProps, 'exportType'>) {
  return <ExportButton {...props} exportType="pdf" />
}

export function ExportDOCXButton(props: Omit<ExportButtonProps, 'exportType'>) {
  return <ExportButton {...props} exportType="docx" />
}

export function ExportCSVButton(props: Omit<ExportButtonProps, 'exportType'>) {
  return <ExportButton {...props} exportType="csv" />
}

// Export dropdown for multiple formats
interface ExportDropdownProps {
  exports: Array<{
    type: 'pdf' | 'docx' | 'csv'
    endpoint: string
    filename: string
    label?: string
  }>
  buttonLabel?: string
  buttonVariant?: 'primary' | 'secondary' | 'outline'
  buttonSize?: 'sm' | 'md' | 'lg'
}

export function ExportDropdown({
  exports,
  buttonLabel = 'Export',
  buttonVariant = 'outline',
  buttonSize = 'md'
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 ${
          buttonSize === 'sm' ? 'px-3 py-1.5 text-sm' :
          buttonSize === 'lg' ? 'px-6 py-3 text-lg' :
          'px-4 py-2 text-base'
        } ${
          buttonVariant === 'primary' ? 'bg-[#d4a561] text-white hover:bg-[#b8965a]' :
          buttonVariant === 'secondary' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300' :
          'border-2 border-[#d4a561] text-[#d4a561] hover:bg-[#d4a561] hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{buttonLabel}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
            {exports.map((exp, index) => (
              <div key={index} className="px-2">
                <ExportButton
                  exportType={exp.type}
                  endpoint={exp.endpoint}
                  filename={exp.filename}
                  label={exp.label}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
