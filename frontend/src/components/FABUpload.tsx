'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FAB } from './Button'

interface FABUploadProps {
  /** Maximum file size in MB */
  maxSize?: number
  /** Accepted file types */
  acceptedTypes?: string[]
  /** Show on specific pages only */
  showOnPages?: string[]
  /** Custom upload handler */
  onUpload?: (file: File) => Promise<void>
}

export function FABUpload({
  maxSize = 10,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt'],
  showOnPages = [],
  onUpload
}: FABUploadProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Check if we should show the FAB on this page
  const shouldShow = showOnPages.length === 0 || showOnPages.some(page =>
    typeof window !== 'undefined' && window.location.pathname.includes(page)
  )

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`)
      return
    }

    setIsUploading(true)
    setIsMenuOpen(false)

    try {
      if (onUpload) {
        await onUpload(file)
      } else {
        // Default behavior: navigate to analyze page with file
        // In production, you'd handle the file upload here
        router.push('/analyze?upload=true')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [maxSize, acceptedTypes, onUpload, router])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Quick actions menu items
  const quickActions = [
    {
      id: 'upload',
      label: 'Upload Document',
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      onClick: () => fileInputRef.current?.click()
    },
    {
      id: 'analyze',
      label: 'Analyze Contract',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onClick: () => router.push('/analyze')
    },
    {
      id: 'draft',
      label: 'Draft Contract',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      onClick: () => router.push('/drafting')
    },
    {
      id: 'compare',
      label: 'Compare Docs',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      onClick: () => router.push('/compare')
    }
  ]

  if (!shouldShow) return null

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag and drop overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 bg-[#1a2e1a]/90 backdrop-blur-sm flex items-center justify-center"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#d4a561]/20 flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Drop your document here</h3>
            <p className="text-[#d4c5b0]">We accept {acceptedTypes.join(', ')} up to {maxSize}MB</p>
          </div>
        </div>
      )}

      {/* Quick actions menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu */}
          <div className="fixed bottom-24 right-6 z-40 w-64 bg-white/95 dark:bg-[#2d5a2d]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#d4a561]/20 overflow-hidden animate-fade-in-up">
            <div className="p-3 space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.onClick()
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#d4a561]/10 transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#d4a561]/20 flex items-center justify-center group-hover:bg-[#d4a561] group-hover:scale-110 transition-all duration-200">
                    <svg className="w-5 h-5 text-[#d4a561] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] group-hover:text-[#d4a561] transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tip */}
            <div className="px-4 py-3 bg-[#d4a561]/5 border-t border-[#d4a561]/20">
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                You can also drag & drop files anywhere
              </p>
            </div>
          </div>
        </>
      )}

      {/* Main FAB */}
      <FAB
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={isUploading ? 'animate-pulse' : ''}
        disabled={isUploading}
        onDragEnter={handleDragEnter}
      >
        {isUploading ? (
          <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </FAB>

      {/* Tooltip (desktop only) */}
      {!isMenuOpen && !isUploading && (
        <div className="hidden lg:block fixed bottom-8 right-24 z-30 px-3 py-2 bg-[#1a2e1a] text-white text-sm font-medium rounded-lg shadow-lg animate-fade-in pointer-events-none">
          Quick actions
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-[#1a2e1a] rotate-45" />
        </div>
      )}
    </>
  )
}
