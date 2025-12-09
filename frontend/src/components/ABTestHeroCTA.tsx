// A/B Test Example: Hero CTA Button Text

'use client'

import { useABTest } from '@/hooks/useABTest'
import Link from 'next/link'

export function ABTestHeroCTA() {
  const { variant, isVariant, trackConversion, isLoading } = useABTest('hero-cta')

  // Show loading state or default while determining variant
  if (isLoading || !variant) {
    return (
      <Link
        href="/analyze"
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        Get Started Free
        <svg
          className="h-5 w-5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    )
  }

  // Track conversion when button is clicked
  const handleClick = () => {
    trackConversion('hero_cta_click')
  }

  // Variant A: Emphasize no credit card required
  if (isVariant('variant-a')) {
    return (
      <Link
        href="/analyze"
        onClick={handleClick}
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        Try Now - No Credit Card
        <svg
          className="h-5 w-5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    )
  }

  // Control: Original text
  return (
    <Link
      href="/analyze"
      onClick={handleClick}
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
    >
      Get Started Free
      <svg
        className="h-5 w-5 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  )
}
