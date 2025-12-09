// A/B Testing utilities for DafLegal
// Using localStorage for client-side variant assignment and tracking

export type VariantId = string
export type ExperimentId = string

export interface Experiment {
  id: ExperimentId
  name: string
  variants: Variant[]
  enabled: boolean
  targetUrl?: string // Optional URL pattern to target
}

export interface Variant {
  id: VariantId
  name: string
  weight: number // Weight for distribution (e.g., 0.5 = 50%)
}

export interface ExperimentAssignment {
  experimentId: ExperimentId
  variantId: VariantId
  assignedAt: string
}

// Storage keys
const STORAGE_KEY = 'daflegal_ab_tests'
const EVENTS_KEY = 'daflegal_ab_events'

/**
 * Get all active experiments
 */
export function getExperiments(): Experiment[] {
  return [
    {
      id: 'hero-cta',
      name: 'Hero CTA Button Text',
      enabled: true,
      variants: [
        { id: 'control', name: 'Get Started Free', weight: 0.5 },
        { id: 'variant-a', name: 'Try Now - No Credit Card', weight: 0.5 },
      ],
    },
    {
      id: 'pricing-display',
      name: 'Pricing Display Format',
      enabled: true,
      targetUrl: '/pricing',
      variants: [
        { id: 'control', name: 'Monthly Upfront', weight: 0.5 },
        { id: 'variant-a', name: 'Annual Savings', weight: 0.5 },
      ],
    },
    {
      id: 'social-proof',
      name: 'Social Proof Notification',
      enabled: true,
      variants: [
        { id: 'control', name: 'Recent Activity', weight: 0.33 },
        { id: 'variant-a', name: 'User Count', weight: 0.33 },
        { id: 'variant-b', name: 'Testimonial', weight: 0.34 },
      ],
    },
  ]
}

/**
 * Get user's assigned variant for an experiment
 */
export function getVariant(experimentId: ExperimentId): VariantId | null {
  if (typeof window === 'undefined') return null

  const assignments = getAssignments()
  const assignment = assignments.find((a) => a.experimentId === experimentId)

  if (assignment) {
    return assignment.variantId
  }

  // First visit - assign variant
  const experiment = getExperiments().find((e) => e.id === experimentId)
  if (!experiment || !experiment.enabled) return null

  const variantId = assignVariant(experiment)
  saveAssignment(experimentId, variantId)

  return variantId
}

/**
 * Assign a variant based on weighted distribution
 */
function assignVariant(experiment: Experiment): VariantId {
  const random = Math.random()
  let cumulative = 0

  for (const variant of experiment.variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return variant.id
    }
  }

  // Fallback to first variant (should never happen with proper weights)
  return experiment.variants[0].id
}

/**
 * Get all user's experiment assignments
 */
function getAssignments(): ExperimentAssignment[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save experiment assignment
 */
function saveAssignment(experimentId: ExperimentId, variantId: VariantId): void {
  if (typeof window === 'undefined') return

  const assignments = getAssignments()
  const newAssignment: ExperimentAssignment = {
    experimentId,
    variantId,
    assignedAt: new Date().toISOString(),
  }

  const updated = [
    ...assignments.filter((a) => a.experimentId !== experimentId),
    newAssignment,
  ]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save A/B test assignment:', error)
  }
}

/**
 * Track conversion event for an experiment
 */
export function trackConversion(
  experimentId: ExperimentId,
  eventName: string,
  value?: number
): void {
  if (typeof window === 'undefined') return

  const variantId = getVariant(experimentId)
  if (!variantId) return

  const event = {
    experimentId,
    variantId,
    eventName,
    value,
    timestamp: new Date().toISOString(),
  }

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'ab_test_conversion', {
      event_category: 'A/B Testing',
      event_label: `${experimentId}:${variantId}:${eventName}`,
      value: value || 1,
    })
  }

  // Store locally for debugging
  try {
    const events = getEvents()
    events.push(event)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-100))) // Keep last 100
  } catch (error) {
    console.error('Failed to track A/B test conversion:', error)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[A/B Test] Conversion:', event)
  }
}

/**
 * Get conversion events (for debugging)
 */
function getEvents(): any[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(EVENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Track page view for experiment
 */
export function trackExperimentView(experimentId: ExperimentId): void {
  const variantId = getVariant(experimentId)
  if (!variantId) return

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ab_test_view', {
      event_category: 'A/B Testing',
      event_label: `${experimentId}:${variantId}`,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[A/B Test] View: ${experimentId} -> ${variantId}`)
  }
}

/**
 * Get all assignments (for admin/debugging)
 */
export function getAllAssignments(): ExperimentAssignment[] {
  return getAssignments()
}

/**
 * Clear all assignments (for testing)
 */
export function clearAllAssignments(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(EVENTS_KEY)
  } catch (error) {
    console.error('Failed to clear A/B test data:', error)
  }
}

/**
 * Check if variant is active
 */
export function isVariant(experimentId: ExperimentId, variantId: VariantId): boolean {
  return getVariant(experimentId) === variantId
}

// Type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
