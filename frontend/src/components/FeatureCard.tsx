'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface FeatureCardProps {
  id: string
  title: string
  description: string
  href: string
  icon: string
  category: string
  color: string
  badge?: string
  size?: 'small' | 'medium' | 'large'
  popular?: boolean
  usageCount?: number
  lastUsed?: Date
  trending?: 'up' | 'down' | null
  bgImage?: string
}

export function FeatureCard({
  id,
  title,
  description,
  href,
  icon,
  category,
  color,
  badge,
  size = 'small',
  popular = false,
  usageCount = 0,
  lastUsed,
  trending = null,
  bgImage = '/webimg2.jpeg'
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Size variants
  const sizeStyles = {
    small: {
      container: 'col-span-1',
      icon: 'w-12 h-12',
      iconSvg: 'w-6 h-6',
      title: 'text-lg',
      description: 'text-sm line-clamp-2',
      padding: 'p-6'
    },
    medium: {
      container: 'col-span-1 md:col-span-1',
      icon: 'w-14 h-14',
      iconSvg: 'w-7 h-7',
      title: 'text-xl',
      description: 'text-sm line-clamp-2',
      padding: 'p-6'
    },
    large: {
      container: 'col-span-1 md:col-span-2 lg:col-span-1',
      icon: 'w-16 h-16',
      iconSvg: 'w-8 h-8',
      title: 'text-2xl',
      description: 'text-base line-clamp-3',
      padding: 'p-8'
    }
  }

  const styles = sizeStyles[size]

  function formatLastUsed(date?: Date): string {
    if (!date) return 'Never used'
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 3600) return 'Used recently'
    if (seconds < 86400) return `Used ${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `Used ${Math.floor(seconds / 86400)}d ago`
    return 'Used a while ago'
  }

  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden
        bg-white/70 dark:bg-[#2d5a2d]/70 backdrop-blur-sm
        ${styles.padding} rounded-2xl
        hover:shadow-2xl transition-all duration-300
        hover:scale-105 active:scale-100
        border border-[#d4a561]/10 hover:border-[#d4a561]/50
        ${styles.container}
        ${size === 'large' ? 'min-h-[320px]' : size === 'medium' ? 'min-h-[240px]' : 'min-h-[200px]'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <Image
          src={bgImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`
            flex-shrink-0 ${styles.icon}
            rounded-xl bg-gradient-to-br ${color}
            flex items-center justify-center
            group-hover:scale-110 transition-transform shadow-lg
          `}>
            <svg
              className={`${styles.iconSvg} text-[#1a2e1a] dark:text-[#f5edd8]`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            {popular && (
              <span className="px-3 py-1 bg-[#d4a561] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Popular
              </span>
            )}
            {badge && (
              <span className="px-3 py-1 bg-[#d4a561]/20 text-[#d4a561] text-xs font-bold rounded-full">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={`
          ${styles.title} font-bold
          text-[#1a2e1a] dark:text-[#f5edd8]
          mb-2 group-hover:text-[#d4a561] transition-colors
        `}>
          {title}
        </h3>

        {/* Description */}
        <p className={`
          ${styles.description}
          text-[#8b7355] dark:text-[#d4c5b0]
          mb-4 flex-1
        `}>
          {description}
        </p>

        {/* Stats & Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-xs text-[#8b7355] dark:text-[#d4c5b0]">
            {usageCount > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Used {usageCount}x</span>
                {trending && (
                  <span className={trending === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {trending === 'up' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            )}
            {lastUsed && (
              <span>{formatLastUsed(lastUsed)}</span>
            )}
          </div>

          {/* CTA Arrow */}
          <div className="flex items-center text-[#d4a561] font-medium text-sm">
            <span className={size === 'large' ? 'mr-2' : 'hidden md:inline mr-2'}>
              {size === 'large' ? 'Try it now' : 'Explore'}
            </span>
            <svg
              className="w-4 h-4 group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Hover Preview (Large cards only) */}
        {size === 'large' && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/95 to-transparent z-20 flex items-end p-8 animate-fade-in-up">
            <div className="w-full">
              <h4 className="text-white font-bold text-lg mb-2">Quick Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI-powered analysis</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant results in seconds</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Export-ready reports</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

// Grid container helper
export function FeatureCardGrid({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  )
}
