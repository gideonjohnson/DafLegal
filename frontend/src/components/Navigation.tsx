'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="nav-leather sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all relative bg-white p-0.5">
              <Image
                src="/logo.png"
                alt="DafLegal Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div>
              <div className="text-base font-bold text-[#f5edd8] tracking-tight leading-none">
                DafLegal
              </div>
              <div className="text-[10px] text-[#d4a561]/80 font-medium tracking-wider leading-none mt-0.5">
                AI LEGAL ASSISTANT
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Clean & Simple */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                  : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
              }`}
            >
              Home
            </Link>
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname?.startsWith('/blog')
                  ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                  : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/pricing'
                  ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                  : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Right Side - Theme Toggle & User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#3d6b3d]/30 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#3d6b3d]/20 animate-fade-in-up">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/'
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md'
                    : 'glass-leather text-[#1a2e1a] hover:shadow-lg'
                }`}
              >
                Home
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname?.startsWith('/blog')
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md'
                    : 'glass-leather text-[#1a2e1a] hover:shadow-lg'
                }`}
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/pricing'
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md'
                    : 'glass-leather text-[#1a2e1a] hover:shadow-lg'
                }`}
              >
                Pricing
              </Link>
              
              {/* Mobile CTA */}
              <div className="mt-3 pt-3 border-t border-[#3d6b3d]/20">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="glass-leather px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg text-[#1a2e1a] mb-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-gold text-center text-sm font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 block"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
