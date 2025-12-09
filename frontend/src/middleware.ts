import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/request'

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Don't add locale prefix for default locale
})

export default function middleware(request: NextRequest) {
  // Run i18n middleware first
  const response = intlMiddleware(request)

  // Check if user is authenticated for protected routes
  const { pathname } = request.nextUrl

  // Extract locale from pathname if present
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Remove locale prefix to check the actual route
  const pathWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname

  // Protected routes (after locale prefix is removed)
  const protectedRoutes = ['/dashboard', '/settings', '/profile']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check for session token
    const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')

    if (!token) {
      // Redirect to signin with locale prefix if present
      const signInUrl = pathnameLocale
        ? `/${pathnameLocale}/auth/signin`
        : '/auth/signin'
      return NextResponse.redirect(new URL(signInUrl, request.url))
    }
  }

  return response
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
