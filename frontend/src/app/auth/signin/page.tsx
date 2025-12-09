'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg bg-white p-1">
                <img src="/logo.png" alt="DafLegal" className="w-full h-full object-contain" />
              </div>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[#8b7355] dark:text-[#d4c5b0]">
            Sign in to your DafLegal account
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="card-beige p-4 border-l-4 border-[#d4a561]">
          <p className="text-sm font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
            Demo Credentials:
          </p>
          <p className="text-xs text-[#5c4a3d] dark:text-[#d4c5b0]">
            Email: <span className="font-mono bg-[#f5edd8] dark:bg-[#1a2e1a] px-2 py-0.5 rounded">demo@daflegal.com</span>
          </p>
          <p className="text-xs text-[#5c4a3d] dark:text-[#d4c5b0] mt-1">
            Password: <span className="font-mono bg-[#f5edd8] dark:bg-[#1a2e1a] px-2 py-0.5 rounded">demo123</span>
          </p>
        </div>

        {/* Sign In Form */}
        <div className="card-beige p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#2d5a2d] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] placeholder-[#8b7355] dark:placeholder-[#d4c5b0] focus:outline-none focus:ring-2 focus:ring-[#d4a561] transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#2d5a2d] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] placeholder-[#8b7355] dark:placeholder-[#d4c5b0] focus:outline-none focus:ring-2 focus:ring-[#d4a561] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#d4a561] focus:ring-[#d4a561] border-[#d4a561]/20 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#5c4a3d] dark:text-[#d4c5b0]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-[#d4a561] hover:text-[#b8965a]">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4a561]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#f5edd8] dark:bg-[#2d5a2d] text-[#8b7355] dark:text-[#d4c5b0]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#d4a561]/20 rounded-lg bg-white dark:bg-[#2d5a2d] text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#f5edd8] dark:hover:bg-[#1a2e1a] transition-all font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#8b7355] dark:text-[#d4c5b0]">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-[#d4a561] hover:text-[#b8965a]">
            Start your free trial
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
