'use client'

import Image from 'next/image'

interface LoadingAnimationProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingAnimation({ message = 'Loading...', fullScreen = false }: LoadingAnimationProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated Logo */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#d4a561]/20 animate-spin-slow" style={{ width: '120px', height: '120px' }} />

        {/* Middle pulse ring */}
        <div className="absolute inset-2 rounded-full border-2 border-[#d4a561]/40 animate-pulse" />

        {/* Logo container */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="w-20 h-20 rounded-xl bg-white shadow-2xl p-2 animate-float">
            <Image
              src="/logo.png"
              alt="DafLegal"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Animated dots around logo */}
        <div className="absolute inset-0 animate-spin" style={{ width: '120px', height: '120px' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#d4a561] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#d4a561] rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#d4a561] rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#d4a561] rounded-full" />
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
          {message}
        </p>
        <div className="flex items-center gap-1 justify-center">
          <span className="w-2 h-2 bg-[#d4a561] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[#d4a561] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[#d4a561] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#f5edd8]/95 dark:bg-[#1a2e1a]/95 backdrop-blur-md z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

// Simpler spinner for inline use
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#d4a561]/20" />
        {/* Spinning segment */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d4a561] border-r-[#d4a561] animate-spin" />
      </div>
    </div>
  )
}

// Progress bar loader
export function LoadingProgress({ progress = 0, message = 'Processing...' }: { progress?: number, message?: string }) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8]">
          {message}
        </span>
        <span className="text-sm font-bold text-[#d4a561]">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-[#d4a561]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4a561] to-[#e8b977] rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for content
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#d4a561]/10 rounded-lg ${className}`} />
  )
}
