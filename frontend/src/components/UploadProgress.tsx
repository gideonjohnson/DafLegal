'use client'

import { UploadProgress as UploadProgressType, formatBytes, formatSpeed, formatTime } from '@/hooks/useFileUpload'

interface UploadProgressProps {
  progress: UploadProgressType
  status?: 'uploading' | 'processing' | 'complete'
  processingMessage?: string
}

export function UploadProgress({ progress, status = 'uploading', processingMessage }: UploadProgressProps) {
  const isUploading = status === 'uploading' && progress.percentage < 100
  const isProcessing = status === 'processing' || (status === 'uploading' && progress.percentage >= 100)
  const isComplete = status === 'complete'

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Progress Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress.percentage / 100)}
              className="text-[#d4a561] transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>

          {/* Percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
              {progress.percentage}%
            </span>
            {isComplete && (
              <svg className="w-6 h-6 text-green-500 mt-1 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* File name */}
        <p className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-1 truncate max-w-md text-center px-4">
          {progress.fileName}
        </p>

        {/* Status text */}
        <p className="text-lg font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mb-1">
          {isComplete ? 'Upload Complete!' : isProcessing ? (processingMessage || 'Processing...') : 'Uploading...'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#d4a561] to-[#b8965a] transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress.percentage}%` }}
        >
          {/* Animated shine effect */}
          {isUploading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Uploaded */}
        <div className="card-beige p-3 text-center">
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-1">Uploaded</p>
          <p className="text-sm font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
            {formatBytes(progress.loaded)}
          </p>
        </div>

        {/* Total size */}
        <div className="card-beige p-3 text-center">
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-1">Total Size</p>
          <p className="text-sm font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
            {formatBytes(progress.total)}
          </p>
        </div>

        {/* Speed */}
        <div className="card-beige p-3 text-center">
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-1">Speed</p>
          <p className="text-sm font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
            {isUploading ? formatSpeed(progress.speed) : '--'}
          </p>
        </div>

        {/* Time remaining */}
        <div className="card-beige p-3 text-center">
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mb-1">Remaining</p>
          <p className="text-sm font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
            {isUploading && progress.timeRemaining > 0 ? formatTime(progress.timeRemaining) : '--'}
          </p>
        </div>
      </div>

      {/* Processing steps */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[#8b7355] dark:text-[#d4c5b0]">Uploaded</span>
          </div>

          <svg className="w-4 h-4 text-[#8b7355] dark:text-[#d4c5b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#d4a561] rounded-full animate-pulse" />
            <span className="text-[#1a2e1a] dark:text-[#f5edd8] font-medium">Processing</span>
          </div>
        </div>
      )}

      {/* Complete checkmark */}
      {isComplete && (
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 animate-fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">File processed successfully</span>
        </div>
      )}
    </div>
  )
}

// Compact version for smaller spaces
export function UploadProgressCompact({ progress, status = 'uploading' }: UploadProgressProps) {
  const isProcessing = status === 'processing' || progress.percentage >= 100

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-2">
        {/* Mini spinner */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 * (1 - progress.percentage / 100)}
              className="text-[#d4a561] transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
              {progress.percentage}%
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] truncate">
            {progress.fileName}
          </p>
          <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">
            {formatBytes(progress.loaded)} of {formatBytes(progress.total)}
            {progress.speed > 0 && ` • ${formatSpeed(progress.speed)}`}
            {progress.timeRemaining > 0 && !isProcessing && ` • ${formatTime(progress.timeRemaining)} left`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-[#d4a561] transition-all duration-300 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  )
}
