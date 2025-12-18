'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)
  const pathname = usePathname()

  // Features organized by category
  const featureGroups = [
    {
      category: 'Analysis',
      features: [
        { name: 'Contract Analysis', href: '/analyze', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Timeline Builder', href: '/timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Compare Contracts', href: '/compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ]
    },
    {
      category: 'Creation & Management',
      features: [
        { name: 'Contract Drafting', href: '/drafting', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', popular: true },
        { name: 'Clause Library', href: '/clauses', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Client Intake', href: '/intake', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ]
    },
    {
      category: 'Compliance & Research',
      features: [
        { name: 'Compliance Checker', href: '/compliance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Legal Research', href: '/research', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { name: 'Citation Checker', href: '/citations', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
      ]
    },
    {
      category: 'Specialized',
      features: [
        { name: 'Conveyancing', href: '/conveyancing', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      ]
    }
  ]

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

          {/* Desktop Navigation */}
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

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsFeaturesOpen(true)}
              onMouseLeave={() => setIsFeaturesOpen(false)}
            >
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  pathname?.startsWith('/analyze') ||
                  pathname?.startsWith('/timeline') ||
                  pathname?.startsWith('/compare') ||
                  pathname?.startsWith('/drafting') ||
                  pathname?.startsWith('/clauses') ||
                  pathname?.startsWith('/compliance') ||
                  pathname?.startsWith('/research') ||
                  pathname?.startsWith('/citations') ||
                  pathname?.startsWith('/intake') ||
                  pathname?.startsWith('/conveyancing')
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                    : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
                }`}
              >
                Features
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isFeaturesOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] glass-leather rounded-xl shadow-2xl p-6 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-6">
                    {featureGroups.map((group) => (
                      <div key={group.category}>
                        <h3 className="text-xs font-bold text-[#d4a561] uppercase tracking-wider mb-3">
                          {group.category}
                        </h3>
                        <div className="space-y-1">
                          {group.features.map((feature) => (
                            <Link
                              key={feature.href}
                              href={feature.href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#3d6b3d]/30 transition-all duration-200 group"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#d4a561]/10 flex items-center justify-center group-hover:bg-[#d4a561]/20 transition-colors">
                                <svg className="w-4 h-4 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#f5edd8] group-hover:text-white transition-colors">
                                    {feature.name}
                                  </span>
                                  {feature.popular && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d4a561] text-[#1a2e1a]">
                                      POPULAR
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Features Link */}
                  <div className="mt-4 pt-4 border-t border-[#3d6b3d]/30">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-[#d4a561] hover:text-[#e8b977] transition-colors"
                    >
                      View All Features
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
            aria-label="Toggle menu"
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

              {/* Mobile Features - Expandable */}
              <div>
                <button
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 glass-leather text-[#1a2e1a] hover:shadow-lg flex items-center justify-between"
                >
                  Features
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isFeaturesOpen && (
                  <div className="mt-2 ml-4 space-y-1">
                    {featureGroups.flatMap(group => group.features).map((feature) => (
                      <Link
                        key={feature.href}
                        href={feature.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 rounded-lg text-sm text-[#1a2e1a] hover:bg-[#3d6b3d]/20 transition-all"
                      >
                        {feature.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

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
