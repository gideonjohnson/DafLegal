'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
    <nav className="nav-leather sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - More Compact */}
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

          {/* Desktop Navigation - Clean & Compact */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/'
                  ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                  : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
              }`}
            >
              Home
            </Link>
            {features.slice(0, 4).map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(feature.href)
                    ? 'bg-[#d4a561] text-[#1a2e1a] shadow-sm'
                    : 'text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30'
                }`}
              >
                {feature.label}
              </Link>
            ))}

            {/* Tools Dropdown - Cleaner */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-[#c4d4c4] hover:text-[#f5edd8] hover:bg-[#3d6b3d]/30 transition-all duration-200 flex items-center gap-1">
                Tools
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 -translate-y-1">
                <div className="glass-leather rounded-lg p-1.5 shadow-xl border border-[#d4a561]/20">
                  {[...features.slice(4), ...moreFeatures].map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-sm font-medium ${
                        isActive(feature.href)
                          ? 'bg-[#d4a561] text-[#1a2e1a]'
                          : 'text-[#1a2e1a] hover:bg-[#3d6b3d]/10'
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                      </svg>
                      {feature.label}
                    </Link>
                  ))}
                  <div className="border-t border-[#d4a561]/20 my-1.5" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[#1a2e1a] hover:bg-[#3d6b3d]/10 transition-all duration-150 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button - Sleeker */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/analyze"
              className="btn-gold text-xs font-bold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get Started →
            </Link>
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

        {/* Mobile Menu - Multi-Row Grid Layout */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#3d6b3d]/20 animate-fade-in-up">
            {/* Full-Width Home Button */}
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full px-4 py-3 rounded-lg text-sm font-bold mb-3 transition-all duration-200 flex items-center justify-center gap-2 ${
                pathname === '/'
                  ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md'
                  : 'bg-[#3d6b3d]/20 text-[#f5edd8] hover:bg-[#3d6b3d]/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>

            {/* 2-3 Column Grid for Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {[...features, ...moreFeatures].map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-4 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[80px] ${
                    isActive(feature.href)
                      ? 'bg-[#d4a561] text-[#1a2e1a] shadow-md scale-105'
                      : 'glass-leather text-[#1a2e1a] hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                  <span className="text-center leading-tight font-semibold">{feature.label}</span>
                </Link>
              ))}
            </div>

            {/* Admin & CTA Row */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="glass-leather px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 text-[#1a2e1a]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
              <Link
                href="/analyze"
                onClick={() => setIsMenuOpen(false)}
                className="btn-gold text-center text-xs font-bold py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
