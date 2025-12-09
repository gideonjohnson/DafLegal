// Accessibility utilities for DafLegal

/**
 * Manage focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement
  private focusableElements: HTMLElement[] = []
  private firstFocusableElement: HTMLElement | null = null
  private lastFocusableElement: HTMLElement | null = null
  private previouslyFocusedElement: HTMLElement | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.updateFocusableElements()
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    this.focusableElements = Array.from(
      this.container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'
    })

    this.firstFocusableElement = this.focusableElements[0] || null
    this.lastFocusableElement =
      this.focusableElements[this.focusableElements.length - 1] || null
  }

  activate() {
    this.previouslyFocusedElement = document.activeElement as HTMLElement
    this.updateFocusableElements()

    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus()
    }

    this.container.addEventListener('keydown', this.handleKeyDown)
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown)

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault()
        this.lastFocusableElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault()
        this.firstFocusableElement?.focus()
      }
    }
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false
  if (element.offsetParent === null) return false
  if (getComputedStyle(element).visibility === 'hidden') return false

  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']
  if (focusableTags.includes(element.tagName)) {
    return !(element as HTMLButtonElement | HTMLInputElement).disabled
  }

  return element.tabIndex >= 0
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(isFocusable)
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0
export function generateId(prefix: string = 'a11y'): string {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now()}`
}

/**
 * Escape key handler
 */
export function onEscapeKey(callback: () => void) {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback()
    }
  }

  document.addEventListener('keydown', handler)

  return () => {
    document.removeEventListener('keydown', handler)
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if high contrast is preferred
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Validate color contrast ratio
 * Returns true if contrast meets WCAG AA standard (4.5:1)
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Get relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  // This is a simplified version - would need a proper color parser in production
  const rgb = hexToRgb(color)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const s = val / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Wait for element to be available (for dynamic content)
 */
export async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) return element
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return null
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * Check if key is activation key (Enter or Space)
 */
export function isActivationKey(key: string): boolean {
  return key === KeyboardKeys.ENTER || key === KeyboardKeys.SPACE
}

/**
 * Check if key is navigation key
 */
export function isNavigationKey(key: string): boolean {
  return [
    KeyboardKeys.ARROW_UP,
    KeyboardKeys.ARROW_DOWN,
    KeyboardKeys.ARROW_LEFT,
    KeyboardKeys.ARROW_RIGHT,
    KeyboardKeys.HOME,
    KeyboardKeys.END,
  ].includes(key)
}
