// React hook for A/B testing

'use client'

import { useEffect, useState } from 'react'
import { getVariant, trackConversion, trackExperimentView, type ExperimentId, type VariantId } from '@/lib/ab-testing'

export interface UseABTestResult {
  variant: VariantId | null
  isVariant: (variantId: VariantId) => boolean
  trackConversion: (eventName: string, value?: number) => void
  isLoading: boolean
}

/**
 * Hook for A/B testing
 *
 * @example
 * const { variant, isVariant, trackConversion } = useABTest('hero-cta')
 *
 * // Render different variants
 * if (isVariant('variant-a')) {
 *   return <button onClick={() => trackConversion('cta_click')}>Try Now</button>
 * }
 * return <button onClick={() => trackConversion('cta_click')}>Get Started</button>
 */
export function useABTest(experimentId: ExperimentId): UseABTestResult {
  const [variant, setVariant] = useState<VariantId | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get variant on client side only
    const assignedVariant = getVariant(experimentId)
    setVariant(assignedVariant)
    setIsLoading(false)

    // Track view
    if (assignedVariant) {
      trackExperimentView(experimentId)
    }
  }, [experimentId])

  const isVariantFn = (variantId: VariantId): boolean => {
    return variant === variantId
  }

  const trackConversionFn = (eventName: string, value?: number): void => {
    trackConversion(experimentId, eventName, value)
  }

  return {
    variant,
    isVariant: isVariantFn,
    trackConversion: trackConversionFn,
    isLoading,
  }
}

/**
 * Hook for simple A/B test with control/variant
 */
export function useSimpleABTest(experimentId: ExperimentId): {
  isVariant: boolean
  trackConversion: (eventName: string, value?: number) => void
  isLoading: boolean
} {
  const { variant, trackConversion, isLoading } = useABTest(experimentId)

  return {
    isVariant: variant !== 'control' && variant !== null,
    trackConversion,
    isLoading,
  }
}
