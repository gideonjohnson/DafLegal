'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'

export function LayoutNav() {
  const pathname = usePathname()
  
  // Don't show navigation on auth pages
  const hideNav = pathname?.startsWith('/auth/') || pathname === '/auth'
  
  if (hideNav) {
    return null
  }
  
  return <Navigation />
}
