# A/B Testing Guide

## Overview

DafLegal implements a lightweight, client-side A/B testing system for optimizing conversion rates and user experience. The system uses localStorage for variant assignment and Google Analytics for tracking.

## Architecture

### Core Components

1. **`src/lib/ab-testing.ts`** - Core A/B testing utilities
2. **`src/hooks/useABTest.ts`** - React hook for easy integration
3. **`src/components/ABTestAdmin.tsx`** - Admin dashboard for monitoring tests
4. **`src/components/ABTestHeroCTA.tsx`** - Example implementation

### Key Features

- **Client-side assignment** - No server required, works with static hosting
- **Persistent assignments** - Users see the same variant across sessions
- **Weighted distribution** - Control traffic split (50/50, 33/33/33, etc.)
- **Analytics integration** - Automatic tracking via Google Analytics
- **Admin dashboard** - View and manage tests at `/admin`

## Active Experiments

### 1. Hero CTA Button Text
- **ID**: `hero-cta`
- **Goal**: Increase click-through rate on homepage CTA
- **Variants**:
  - Control (50%): "Get Started Free"
  - Variant A (50%): "Try Now - No Credit Card"

### 2. Pricing Display Format
- **ID**: `pricing-display`
- **Goal**: Increase pricing page conversions
- **Variants**:
  - Control (50%): Monthly pricing upfront
  - Variant A (50%): Annual savings emphasized

### 3. Social Proof Notification
- **ID**: `social-proof`
- **Goal**: Increase user trust and engagement
- **Variants**:
  - Control (33%): Recent activity notifications
  - Variant A (33%): User count display
  - Variant B (34%): Featured testimonials

## Usage Guide

### Basic Implementation

```typescript
import { useABTest } from '@/hooks/useABTest'

export function MyComponent() {
  const { variant, isVariant, trackConversion, isLoading } = useABTest('experiment-id')

  // Wait for variant assignment
  if (isLoading) {
    return <DefaultComponent />
  }

  // Track conversion when user takes action
  const handleClick = () => {
    trackConversion('button_click')
    // ... your logic
  }

  // Render based on variant
  if (isVariant('variant-a')) {
    return <VariantAComponent onClick={handleClick} />
  }

  return <ControlComponent onClick={handleClick} />
}
```

### Simple A/B Test (Control vs Variant)

```typescript
import { useSimpleABTest } from '@/hooks/useABTest'

export function SimpleTest() {
  const { isVariant, trackConversion } = useSimpleABTest('experiment-id')

  return (
    <button onClick={() => trackConversion('cta_click')}>
      {isVariant ? 'Try Now Free' : 'Get Started'}
    </button>
  )
}
```

### Creating New Experiments

1. **Define the experiment** in `src/lib/ab-testing.ts`:

```typescript
{
  id: 'my-experiment',
  name: 'My Experiment Name',
  enabled: true,
  targetUrl: '/specific-page', // Optional
  variants: [
    { id: 'control', name: 'Control Version', weight: 0.5 },
    { id: 'variant-a', name: 'Test Version', weight: 0.5 },
  ],
}
```

2. **Implement the variants**:

```typescript
export function MyExperiment() {
  const { variant, trackConversion } = useABTest('my-experiment')

  if (variant === 'variant-a') {
    return <TestVersion onAction={() => trackConversion('action')} />
  }

  return <ControlVersion onAction={() => trackConversion('action')} />
}
```

3. **Track conversions** at key points:

```typescript
// Track different conversion events
trackConversion('view')           // Viewed the component
trackConversion('click')          // Clicked a button
trackConversion('signup', 100)    // Signed up (with value)
trackConversion('purchase', 299)  // Made a purchase (with value)
```

## Tracking Events

### Automatic Tracking

1. **View Events** - Automatically tracked when component mounts
2. **Assignment Events** - Tracked when user is assigned to variant

### Manual Tracking

```typescript
import { trackConversion } from '@/lib/ab-testing'

// Track with event name only
trackConversion('experiment-id', 'button_click')

// Track with monetary value
trackConversion('experiment-id', 'purchase', 99.99)
```

### Events Sent to Analytics

All events are sent to Google Analytics with:
- **Event Name**: `ab_test_view` or `ab_test_conversion`
- **Category**: `A/B Testing`
- **Label**: `experiment-id:variant-id:event-name`
- **Value**: Optional monetary value or 1

## Admin Dashboard

Access the A/B testing dashboard at `/admin` to:

- View all active experiments
- See your current variant assignments
- View variant distribution percentages
- Clear assignments to test different variants

### Clearing Assignments

Use the "Clear All Assignments" button to:
1. Remove all localStorage data
2. Get reassigned to new random variants
3. Test different variations

**Note**: In production, users keep their assignments permanently.

## Best Practices

### 1. Sample Size

Run tests until statistical significance:
- **Minimum**: 100 conversions per variant
- **Recommended**: 1000+ conversions per variant
- **Duration**: At least 1-2 weeks (full business cycle)

### 2. One Change at a Time

Test one hypothesis per experiment:
- ✅ Good: Test button color OR button text
- ❌ Bad: Test button color AND text together

### 3. Define Success Metrics

Before launching:
- Define primary metric (e.g., signup rate)
- Define secondary metrics (e.g., time on page)
- Set minimum detectable effect (e.g., 10% improvement)

### 4. Avoid Peeking

Don't stop tests early:
- Wait for statistical significance
- Account for day-of-week effects
- Run for complete business cycles

### 5. Document Results

After each test:
- Document winning variant
- Note confidence level
- Share learnings with team
- Archive or disable experiment

## Analytics Setup

### Google Analytics 4

Events are automatically sent if `window.gtag` is available:

```typescript
// Automatically called by the system
gtag('event', 'ab_test_conversion', {
  event_category: 'A/B Testing',
  event_label: 'hero-cta:variant-a:click',
  value: 1,
})
```

### Custom Analytics

To use a different analytics provider, modify the tracking functions in `src/lib/ab-testing.ts`:

```typescript
export function trackConversion(experimentId, eventName, value) {
  // Your custom analytics code here
  yourAnalytics.track('A/B Test', {
    experiment: experimentId,
    variant: getVariant(experimentId),
    event: eventName,
    value: value,
  })
}
```

## Advanced Usage

### Multi-Variant Tests (A/B/C)

```typescript
{
  id: 'multi-variant',
  name: 'Three-Way Test',
  enabled: true,
  variants: [
    { id: 'control', name: 'Original', weight: 0.33 },
    { id: 'variant-a', name: 'Variation 1', weight: 0.33 },
    { id: 'variant-b', name: 'Variation 2', weight: 0.34 },
  ],
}
```

### Conditional Testing

```typescript
const { variant } = useABTest('experiment-id')

// Only show to logged-in users
if (!isLoggedIn) {
  return <ControlVersion />
}

// Or based on URL
if (pathname !== '/pricing') {
  return <ControlVersion />
}

return variant === 'variant-a' ? <VariantA /> : <Control />
```

### Gradual Rollout

Start with small traffic, increase gradually:

```typescript
// Week 1: 10% test, 90% control
{ id: 'control', weight: 0.9 },
{ id: 'variant-a', weight: 0.1 },

// Week 2: 25% test, 75% control
{ id: 'control', weight: 0.75 },
{ id: 'variant-a', weight: 0.25 },

// Week 3: 50% test, 50% control
{ id: 'control', weight: 0.5 },
{ id: 'variant-a', weight: 0.5 },
```

## Debugging

### Development Mode

In development, all events are logged to console:

```
[A/B Test] View: hero-cta -> variant-a
[A/B Test] Conversion: { experimentId: 'hero-cta', variantId: 'variant-a', eventName: 'click' }
```

### localStorage Inspection

View assignments in browser DevTools:

```javascript
// View assignments
localStorage.getItem('daflegal_ab_tests')

// View conversion events
localStorage.getItem('daflegal_ab_events')

// Clear all data
localStorage.removeItem('daflegal_ab_tests')
localStorage.removeItem('daflegal_ab_events')
```

### Testing Specific Variants

To force a specific variant during development:

```typescript
import { saveAssignment } from '@/lib/ab-testing'

// Force variant-a
localStorage.setItem('daflegal_ab_tests', JSON.stringify([
  {
    experimentId: 'hero-cta',
    variantId: 'variant-a',
    assignedAt: new Date().toISOString()
  }
]))
```

## Statistical Significance

### Required Sample Size

Use this formula to determine sample size:

```
n = (Z * √(p(1-p)))² / MDE²

Where:
- Z = 1.96 (95% confidence)
- p = baseline conversion rate
- MDE = minimum detectable effect
```

Example:
- Baseline: 5% conversion
- Target: 6% conversion (20% lift)
- Required sample: ~4,800 visitors per variant

### Calculating Results

1. **Conversion Rate**: Conversions / Visitors
2. **Lift**: (Variant Rate - Control Rate) / Control Rate
3. **Significance**: Use Chi-square test or z-test

Tools:
- [Optimizely Calculator](https://www.optimizely.com/sample-size-calculator/)
- [AB Test Calculator](https://abtestguide.com/calc/)

## Migration to Advanced Tools

For enterprise needs, consider:

### GrowthBook (Open Source)

```bash
npm install @growthbook/growthbook-react
```

Benefits:
- Feature flags
- Server-side testing
- Advanced targeting
- Statistical analysis

### Optimizely / VWO

Benefits:
- Visual editor
- Advanced segmentation
- Multivariate testing
- Enterprise support

## Troubleshooting

### Variant Not Showing

1. Check experiment is enabled
2. Verify experimentId matches definition
3. Check browser console for errors
4. Confirm localStorage is enabled

### Analytics Not Tracking

1. Verify Google Analytics is loaded
2. Check `window.gtag` exists
3. View Network tab for event calls
4. Check GA4 DebugView in real-time

### Inconsistent Results

1. Clear localStorage and test again
2. Test in incognito mode
3. Check variant weight distribution
4. Verify conversion tracking placement

## Example: Complete Implementation

```typescript
// 1. Define experiment
// In src/lib/ab-testing.ts
{
  id: 'checkout-button',
  name: 'Checkout Button Text',
  enabled: true,
  variants: [
    { id: 'control', name: 'Checkout', weight: 0.5 },
    { id: 'variant-a', name: 'Complete Purchase', weight: 0.5 },
  ],
}

// 2. Create component
// src/components/CheckoutButton.tsx
'use client'

import { useABTest } from '@/hooks/useABTest'

export function CheckoutButton() {
  const { variant, trackConversion } = useABTest('checkout-button')

  const handleClick = () => {
    trackConversion('checkout_click')
    // Proceed to checkout...
  }

  const buttonText = variant === 'variant-a'
    ? 'Complete Purchase'
    : 'Checkout'

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {buttonText}
    </button>
  )
}

// 3. Track conversion
// When user completes purchase:
trackConversion('checkout-button', 'purchase_complete', orderTotal)
```

## Resources

- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Statistical Significance Calculator](https://abtestguide.com/calc/)
- [A/B Testing Best Practices](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [Avoiding P-Hacking](https://www.statsig.com/blog/p-hacking)

## Support

For questions or issues:
1. Check the troubleshooting section above
2. View the admin dashboard at `/admin`
3. Check browser console for debug logs
4. Review localStorage data

---

**Happy Testing!** 🧪
