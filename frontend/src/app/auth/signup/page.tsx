'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      // Register user via backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://daflegal-backend.onrender.com'
      const registerResponse = await fetch(`${backendUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
        }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        setError(errorData.detail || 'Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Registration successful, now sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful, but sign-in failed. Please try signing in.')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f5edd8] to-white dark:from-[#1a2e1a] dark:to-[#2d5a2d]">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg bg-white p-1">
                <img src="/logo.png" alt="DafLegal" className="w-full h-full object-contain" />
              </div>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
            Create your account
          </h1>
          <p className="text-base text-[#8b7355] dark:text-[#d4c5b0]">
            Get started with DafLegal today
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-[#2d5a2d] rounded-2xl shadow-xl p-8 border border-[#d4a561]/10">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Google Sign Up - PRIMARY */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-[#d4a561]/30 rounded-xl bg-white dark:bg-[#1a2e1a] text-[#1a2e1a] dark:text-[#f5edd8] hover:border-[#d4a561] hover:shadow-lg transition-all font-semibold text-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4a561]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-[#2d5a2d] text-[#8b7355] dark:text-[#d4c5b0] font-medium">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* Email/Password Form - SECONDARY */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#1a2e1a] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#1a2e1a] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                placeholder="you@example.com"
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
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#1a2e1a] border border-[#d4a561]/20 text-[#1a2e1a] dark:text-[#f5edd8] focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d4a561] hover:bg-[#b8965a] text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-xs text-center text-[#8b7355] dark:text-[#d4c5b0] mt-4">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[#d4a561] hover:text-[#b8965a] underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#d4a561] hover:text-[#b8965a] underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-[#5c4a3d] dark:text-[#d4c5b0]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-semibold text-[#d4a561] hover:text-[#b8965a] underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
