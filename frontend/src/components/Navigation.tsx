'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const features = [
    { href: '/analyze', label: 'Analyze', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { href: '/timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/compare', label: 'Compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { href: '/clauses', label: 'Clauses', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/compliance', label: 'Compliance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/drafting', label: 'Drafting', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  ]

  const moreFeatures = [
    { href: '/conveyancing', label: 'Property', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/research', label: 'Research', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { href: '/citations', label: 'Citations', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { href: '/intake', label: 'Intake', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="nav-leather sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="icon-box-3d w-12 h-12 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-[#f5edd8] tracking-tight">
                DafLegal
              </div>
              <div className="text-xs text-[#d4a561] font-semibold tracking-wide">
                AI Legal Assistant
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                pathname === '/'
                  ? 'nav-btn-3d-active text-[#1a2e1a]'
                  : 'nav-btn-3d text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/40'
              }`}
            >
              Home
            </Link>
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive(feature.href)
                    ? 'nav-btn-3d-active text-[#1a2e1a]'
                    : 'nav-btn-3d text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/40'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                </svg>
                {feature.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative group">
              <button className="nav-btn-3d px-3 py-2.5 rounded-xl font-semibold text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/40 transition-all duration-300 flex items-center gap-1">
                More
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                <div className="glass-leather rounded-2xl p-3 shadow-2xl border border-[#d4a561]/20">
                  {moreFeatures.map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                        isActive(feature.href)
                          ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md'
                          : 'text-[#1a2e1a] hover:bg-[#3d6b3d]/15 hover:pl-5'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                      </svg>
                      {feature.label}
                    </Link>
                  ))}
                  <div className="border-t border-[#d4a561]/30 my-2" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1a2e1a] hover:bg-[#3d6b3d]/15 hover:pl-5 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex">
            <Link href="/analyze" className="btn-gold text-sm font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Get Started Free →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-xl hover:bg-[#3d6b3d]/40 transition-all duration-300 hover:shadow-md"
          >
            <svg className="w-6 h-6 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
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
          <div className="lg:hidden py-6 border-t border-[#3d6b3d]/30 animate-fade-in-up">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  pathname === '/'
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-lg'
                    : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/40 hover:pl-6'
                }`}
              >
                Home
              </Link>
              {[...features, ...moreFeatures].map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    isActive(feature.href)
                      ? 'bg-[#d4a561] text-[#1a2e1a] shadow-lg'
                      : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/40 hover:pl-6'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                  {feature.label}
                </Link>
              ))}
              <div className="border-t border-[#d4a561]/30 my-4" />
              <Link
                href="/analyze"
                onClick={() => setIsMenuOpen(false)}
                className="btn-gold text-center font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
