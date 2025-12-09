// Hook for announcing messages to screen readers

'use client'

import { useCallback } from 'react'
import { announceToScreenReader } from '@/lib/accessibility'

export function useAriaAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])

  return { announce }
}

/**
 * Example usage:
 *
 * const { announce } = useAriaAnnounce()
 *
 * const handleSave = () => {
 *   saveData()
 *   announce('Your changes have been saved')
 * }
 *
 * const handleError = () => {
 *   announce('An error occurred. Please try again', 'assertive')
 * }
 */
