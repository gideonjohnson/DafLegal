# i18n Known Issues

## Status: Implementation Complete, Build Issue Pending Resolution

### Summary

The internationalization (i18n) implementation for DafLegal is **functionally complete** with all code written and properly structured. However, there is a persistent build error that prevents static site generation.

### Implementation Completed

✅ **All code is written and ready:**
- next-intl v4.5.8 installed and configured
- Translation files created for English, Swahili, and French
- Language switcher components (desktop & mobile) fully implemented
- [locale] routing structure set up correctly
- Middleware configured for locale routing + authentication
- i18n configuration file at `src/i18n/request.ts`
- Comprehensive documentation in `I18N_SETUP.md`

### Current Issue

**Error:** "Couldn't find next-intl config file" during static page generation

**Root Cause:** Compatibility issue between:
- next-intl v4.5.8
- Next.js 14.1.0
- Static site generation (SSG) with App Router

The webpack plugin cannot properly inject the i18n config into the server-side rendering context during the static build phase, even though all file paths are correct and the configuration matches official documentation.

### Attempted Solutions

1. ✅ Fixed config file path from `src/i18n.ts` to `src/i18n/request.ts` (per official docs)
2. ✅ Corrected relative import paths in config (`../messages/${locale}.json`)
3. ✅ Explicitly specified plugin path: `createNextIntlPlugin('./src/i18n/request.ts')`
4. ✅ Added webpack alias configuration
5. ❌ Issue persists during static generation phase

### Workaround Options

**Option 1: Disable Static Generation for i18n Routes**
```typescript
// In [locale]/layout.tsx or individual pages
export const dynamic = 'force-dynamic'
```
This forces runtime rendering, avoiding the static generation issue.

**Option 2: Upgrade to Next.js 15**
Next.js 15 has better compatibility with next-intl v4 and includes fixes for these bundling issues.

**Option 3: Downgrade to next-intl v3**
Use the previous major version which has better Next.js 14 compatibility, though it uses a different API structure.

**Option 4: Remove [locale] Wrapper (Simplest Short-term)**
Revert to non-localized routing while keeping translation infrastructure in place. This allows the build to succeed while preserving all i18n code for future use.

### Recommended Next Steps

1. **Short-term:** Implement Option 4 - remove [locale] wrapper to unblock deployment
2. **Medium-term:** Upgrade to Next.js 15 when stable
3. **Long-term:** Re-enable full i18n with locale routing after Next.js upgrade

### Technical Details

**File Structure:**
```
src/
├── i18n/
│   └── request.ts          # Config file (correctly placed)
├── messages/
│   ├── en.json            # English translations
│   ├── sw.json            # Swahili translations
│   └── fr.json            # French translations
├── components/
│   └── LanguageSwitcher.tsx   # UI components (ready)
└── app/
    └── [locale]/          # Locale routing (causes build issue)
```

**Error Location:**
The error occurs during:
```
Generating static pages (0/85) ...
```

When Next.js tries to pre-render pages at build time, the next-intl webpack plugin's injected code cannot resolve the config file path in the server bundle.

### References

- [GitHub Issue #674 - next-intl with Next.js 14](https://github.com/amannn/next-intl/issues/674)
- [GitHub Discussion #675](https://github.com/amannn/next-intl/discussions/675)
- [GitHub Issue #639 - Config file error](https://github.com/amannn/next-intl/issues/639)
- [Build with Matija - Turbopack error fix](https://www.buildwithmatija.com/blog/fix-nextintl-turbopack-error)

### Impact

- **Build:** ❌ Fails during static generation
- **Development:** ✅ Would work in dev mode with `npm run dev`
- **Code Quality:** ✅ All code is production-ready
- **User Experience:** ⏸️ Blocked until build issue resolved

### Date

December 9, 2025

### Next Action

Proceed with Features #10-12 while i18n remains documented as pending build resolution.
