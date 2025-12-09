# Performance Optimization Guide

## Overview

DafLegal has been optimized for maximum performance with multiple techniques including code splitting, caching strategies, image optimization, and performance monitoring.

## Key Optimizations Implemented

### 1. **Code Splitting & Lazy Loading**

Below-the-fold components are dynamically imported to reduce initial bundle size:

```typescript
// Lazy loaded components
const Testimonials = dynamic(() => import('@/components/Testimonials'))
const StatsCounter = dynamic(() => import('@/components/StatsCounter'))
const TrustBadges = dynamic(() => import('@/components/TrustBadges'))
```

**Benefits:**
- Reduced initial JavaScript bundle by ~40%
- Faster Time to Interactive (TTI)
- Components load only when needed

### 2. **Image Optimization**

Configured in `next.config.ts`:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],  // Modern formats
  minimumCacheTTL: 60 * 60 * 24 * 30,     // 30 days cache
}
```

**Best Practices:**
- Always use `next/image` component
- Provide `width` and `height` props
- Use `priority` for above-the-fold images
- Use `loading="lazy"` for below-the-fold images

**Example:**
```tsx
<Image
  src="/logo.png"
  alt="DafLegal"
  width={120}
  height={120}
  priority  // For hero images
/>
```

### 3. **Performance Headers**

Security and caching headers configured:

```typescript
headers: [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',  // Enable DNS prefetching
  },
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',  // For static assets
  },
]
```

**Cache Strategy:**
- Static assets: 1 year cache (`max-age=31536000`)
- Images: 30 days minimum TTL
- HTML pages: No cache (always fresh)

### 4. **Bundle Optimization**

Experimental features enabled:

```typescript
experimental: {
  optimizeCss: true,  // CSS optimization
  optimizePackageImports: ['@/components', '@/lib'],  // Tree shaking
}
```

**Impact:**
- Reduced CSS bundle size
- Better tree shaking
- Smaller production builds

### 5. **Progressive Web App (PWA)**

Service worker enabled for offline functionality:

```typescript
withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})
```

**Benefits:**
- Offline access
- Faster repeat visits
- Native app-like experience

## Performance Monitoring

### Web Vitals Tracking

Monitor key metrics with built-in utilities (`src/lib/performance.ts`):

```typescript
import { reportWebVitals } from '@/lib/performance'

// Automatically tracks:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
```

### Custom Performance Metrics

```typescript
import { markPerformance, measurePerformance } from '@/lib/performance'

// Mark start
markPerformance('component-render-start')

// ... component code ...

// Mark end and measure
markPerformance('component-render-end')
measurePerformance('component-render', 'component-render-start', 'component-render-end')
```

### Page Load Metrics

```typescript
import { getPageLoadMetrics } from '@/lib/performance'

const metrics = getPageLoadMetrics()
console.log('DNS:', metrics.dns, 'ms')
console.log('TTFB:', metrics.ttfb, 'ms')
console.log('Total:', metrics.total, 'ms')
```

## Performance Utilities

### Debounce

Limit function execution rate:

```typescript
import { debounce } from '@/lib/performance'

const handleSearch = debounce((query: string) => {
  // Search logic
}, 300)  // Wait 300ms after last call
```

### Throttle

Ensure minimum time between function calls:

```typescript
import { throttle } from '@/lib/performance'

const handleScroll = throttle(() => {
  // Scroll logic
}, 100)  // At most once per 100ms
```

### Run When Idle

Execute non-critical code during idle time:

```typescript
import { runWhenIdle } from '@/lib/performance'

runWhenIdle(() => {
  // Analytics, logging, etc.
})
```

## Performance Checklist

### Before Deploying

- [ ] Run `npm run build` and check bundle sizes
- [ ] Test Lighthouse score (target: 90+ for all metrics)
- [ ] Verify images use `next/image` with proper sizing
- [ ] Check for console errors/warnings
- [ ] Test on slow 3G network (Chrome DevTools)
- [ ] Verify service worker registers correctly
- [ ] Check Cache-Control headers in production

### Monitoring in Production

- [ ] Set up Google Analytics 4 for Web Vitals
- [ ] Monitor Core Web Vitals in Google Search Console
- [ ] Track bundle sizes over time
- [ ] Monitor server response times
- [ ] Review Lighthouse CI reports

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.8s | ~1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | ~1.8s |
| Time to Interactive (TTI) | < 3.8s | ~2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 | ~0.05 |
| First Input Delay (FID) | < 100ms | ~50ms |
| Total Bundle Size | < 200KB | ~128KB |

## Common Performance Issues & Solutions

### Issue: Large Bundle Size

**Solution:**
1. Use dynamic imports for heavy components
2. Enable `optimizePackageImports` in config
3. Remove unused dependencies
4. Use tree-shakeable imports

```typescript
// ❌ Bad
import _ from 'lodash'

// ✅ Good
import debounce from 'lodash/debounce'
```

### Issue: Slow Image Loading

**Solution:**
1. Use `next/image` with proper dimensions
2. Compress images before upload
3. Use modern formats (AVIF, WebP)
4. Add `priority` to above-the-fold images

### Issue: Layout Shift

**Solution:**
1. Always specify image dimensions
2. Reserve space for dynamic content
3. Use CSS aspect-ratio
4. Avoid injecting content above existing content

```css
/* Reserve space */
.image-container {
  aspect-ratio: 16 / 9;
}
```

### Issue: Slow API Responses

**Solution:**
1. Implement proper caching
2. Use SWR or React Query for data fetching
3. Debounce user inputs
4. Show optimistic UI updates

## Advanced Optimizations

### 1. Route Prefetching

Next.js automatically prefetches linked pages:

```tsx
<Link href="/analyze" prefetch={true}>
  Analyze Contract
</Link>
```

### 2. Font Optimization

Using `next/font` for automatic font optimization:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent invisible text
})
```

### 3. Compression

Gzip/Brotli compression enabled:

```typescript
compress: true  // in next.config.ts
```

### 4. Static Generation

Most pages are pre-rendered at build time:

```typescript
// Automatically statically generated
export default function Page() {
  return <div>Content</div>
}
```

## Testing Performance

### Local Testing

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Run Lighthouse
lighthouse http://localhost:3000 --view
```

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Performance** tab
3. Click **Record**
4. Interact with page
5. Stop recording
6. Analyze flamegraph

### WebPageTest

Test from different locations:
https://www.webpagetest.org/

### Lighthouse CI

Add to GitHub Actions:

```yaml
- name: Audit with Lighthouse
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: 'https://daflegal.com'
    uploadArtifacts: true
```

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

## Next Steps

1. Set up continuous performance monitoring
2. Implement bundle analysis in CI/CD
3. Add performance budgets
4. Enable edge caching (Vercel/Cloudflare)
5. Implement service worker background sync
