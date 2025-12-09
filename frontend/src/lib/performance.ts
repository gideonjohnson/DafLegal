// Performance monitoring utilities for DafLegal

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: {
  id: string
  name: string
  value: number
  label: 'web-vital' | 'custom'
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', metric.name, metric.value)
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Custom Metrics',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, startTime: number) {
  const duration = performance.now() - startTime

  if (process.env.NODE_ENV === 'development' && duration > 16) {
    console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render (>16ms)`)
  }

  return duration
}

/**
 * Lazy load component with loading state
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = React.lazy(factory)
  ;(Component as any).preload = factory
  return Component
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * Mark performance milestones
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

/**
 * Measure time between marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`)
      }
    } catch (error) {
      // Marks may not exist
    }
  }
}

/**
 * Check if page is loaded from cache
 */
export function isPageCached(): boolean {
  if (typeof window === 'undefined') return false

  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  return navEntry?.transferSize === 0
}

/**
 * Get page load metrics
 */
export function getPageLoadMetrics() {
  if (typeof window === 'undefined') return null

  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (!navEntry) return null

  return {
    dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
    tcp: navEntry.connectEnd - navEntry.connectStart,
    ttfb: navEntry.responseStart - navEntry.requestStart,
    download: navEntry.responseEnd - navEntry.responseStart,
    domInteractive: navEntry.domInteractive,
    domComplete: navEntry.domComplete,
    loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
    total: navEntry.loadEventEnd,
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * RequestIdleCallback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1)

/**
 * Run function when browser is idle
 */
export function runWhenIdle(callback: () => void) {
  if (typeof window === 'undefined') return

  requestIdleCallback(() => {
    callback()
  })
}

// Type declarations for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// React import for lazy loading
import React from 'react'
