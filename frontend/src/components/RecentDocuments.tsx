'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'txt'
  size: string
  uploadedAt: Date
  status: 'analyzed' | 'processing' | 'draft' | 'error'
  thumbnail?: string
}

// Mock data - replace with real API data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employment_Agreement_2024.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'analyzed'
  },
  {
    id: '2',
    name: 'NDA_Template_v3.docx',
    type: 'docx',
    size: '856 KB',
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'analyzed'
  },
  {
    id: '3',
    name: 'Service_Agreement_Draft.pdf',
    type: 'pdf',
    size: '1.8 MB',
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'draft'
  },
  {
    id: '4',
    name: 'Terms_and_Conditions.pdf',
    type: 'pdf',
    size: '3.2 MB',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'analyzed'
  },
  {
    id: '5',
    name: 'Privacy_Policy_Update.docx',
    type: 'docx',
    size: '1.1 MB',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'processing'
  },
]

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      )
    case 'docx':
      return (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      )
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'analyzed':
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Analyzed
        </span>
      )
    case 'processing':
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Processing
        </span>
      )
    case 'draft':
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Draft
        </span>
      )
    case 'error':
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Error
        </span>
      )
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function RecentDocuments({ limit = 5 }: { limit?: number }) {
  const [documents] = useState<Document[]>(mockDocuments.slice(0, limit))
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null)

  return (
    <div className="bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#d4a561]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a2e1a] dark:text-[#f5edd8] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Documents
        </h3>
        <Link
          href="/analyze"
          className="text-xs font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#d4a561]/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">
            No documents yet
          </p>
          <Link
            href="/analyze"
            className="inline-block mt-3 text-sm font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors"
          >
            Upload your first document →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative p-3 rounded-lg hover:bg-[#d4a561]/5 transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredDoc(doc.id)}
              onMouseLeave={() => setHoveredDoc(null)}
            >
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-[#1a2e1a] flex items-center justify-center shadow-sm">
                  {getFileIcon(doc.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] truncate group-hover:text-[#d4a561] transition-colors">
                      {doc.name}
                    </h4>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
                      {doc.size}
                    </span>
                    <span className="text-xs text-[#8b7355]/50 dark:text-[#d4c5b0]/50">•</span>
                    <span className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
                      {formatTimeAgo(doc.uploadedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions (visible on hover) */}
                {hoveredDoc === doc.id && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button
                      className="p-1.5 rounded hover:bg-[#d4a561]/20 transition-colors"
                      title="View"
                    >
                      <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-[#d4a561]/20 transition-colors"
                      title="Re-analyze"
                    >
                      <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {documents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#d4a561]/20 flex items-center justify-between">
          <span className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
            {documents.length} recent {documents.length === 1 ? 'document' : 'documents'}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-[#d4a561] hover:text-[#b8965a] transition-colors"
          >
            View All →
          </Link>
        </div>
      )}
    </div>
  )
}
