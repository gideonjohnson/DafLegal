/**
 * Hook for programmatically triggering the Universal Ask Bar
 * Use this to add "Ask about this" quick action buttons on any page
 */

export function useAskBar() {
  const triggerAsk = (question: string) => {
    // Dispatch custom event that UniversalAskBar listens to
    const event = new CustomEvent('trigger-ask', {
      detail: { question }
    })
    window.dispatchEvent(event)
  }

  return { triggerAsk }
}
