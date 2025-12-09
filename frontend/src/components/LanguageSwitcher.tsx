'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { locales, localeLabels, type Locale } from '@/i18n/request'
import { trackButtonClick } from './Analytics'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    startTransition(() => {
      // Remove current locale from pathname if it exists
      const segments = pathname.split('/')
      const currentLocaleInPath = locales.find((l) => segments[1] === l)

      let newPathname = pathname
      if (currentLocaleInPath) {
        // Replace current locale with new one
        segments[1] = newLocale
        newPathname = segments.join('/')
      } else {
        // Add new locale
        newPathname = `/${newLocale}${pathname}`
      }

      trackButtonClick(`language_change_${newLocale}`, 'i18n')
      router.push(newPathname)
      setIsOpen(false)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#d4a561]/10 transition-colors text-sm"
        aria-label="Change language"
        disabled={isPending}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="font-medium">{localeLabels[locale as Locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-[#1a2e1a] border border-[#d4a561]/20 z-20">
            <div className="py-2">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`w-full px-4 py-2 text-left hover:bg-[#d4a561]/10 transition-colors flex items-center justify-between ${
                    loc === locale ? 'bg-[#d4a561]/20' : ''
                  }`}
                  disabled={isPending}
                >
                  <span className="font-medium">{localeLabels[loc]}</span>
                  {loc === locale && (
                    <svg className="w-5 h-5 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg">
          <div className="w-4 h-4 border-2 border-[#d4a561] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Compact version for mobile nav
export function LanguageSwitcherCompact() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale

    startTransition(() => {
      const segments = pathname.split('/')
      const currentLocaleInPath = locales.find((l) => segments[1] === l)

      let newPathname = pathname
      if (currentLocaleInPath) {
        segments[1] = newLocale
        newPathname = segments.join('/')
      } else {
        newPathname = `/${newLocale}${pathname}`
      }

      trackButtonClick(`language_change_${newLocale}`, 'i18n')
      router.push(newPathname)
    })
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleLocaleChange}
        disabled={isPending}
        className="px-3 py-2 rounded-lg border border-[#d4a561]/20 bg-white dark:bg-[#1a2e1a] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a561] pr-8 appearance-none"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
      </select>
      <svg
        className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
