// Hook for managing focus trap in modals and dialogs

'use client'

import { useEffect, useRef } from 'react'
import { FocusTrap } from '@/lib/accessibility'

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)
  const focusTrapRef = useRef<FocusTrap | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    focusTrapRef.current = new FocusTrap(containerRef.current)
    focusTrapRef.current.activate()

    return () => {
      focusTrapRef.current?.deactivate()
    }
  }, [isActive])

  return containerRef
}

/**
 * Example usage:
 *
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap(isOpen)
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   )
 * }
 */
