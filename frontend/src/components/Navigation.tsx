'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    { href: '/compare', label: 'Compare', icon: '⚖️' },
    { href: '/clauses', label: 'Clauses', icon: '📋' },
    { href: '/compliance', label: 'Compliance', icon: '✓' },
    { href: '/drafting', label: 'Drafting', icon: '✍️' },
    { href: '/conveyancing', label: 'Property', icon: '🏡' },
    { href: '/research', label: 'Research', icon: '🔍' },
    { href: '/citations', label: 'Citations', icon: '📝' },
    { href: '/intake', label: 'Intake', icon: '📥' },
    { href: '/admin', label: 'Admin', icon: '📊' },
  ]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-[#6B7A68]/20 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="icon-3d w-14 h-14 bg-gradient-to-br from-[#3D2F28] to-[#526450] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent">
                DafLegal
              </div>
              <div className="text-xs text-gray-600 font-medium -mt-1">AI Legal Assistant</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl font-semibold text-gray-700 hover:text-[#3D2F28] hover:bg-white/50 transition-all"
            >
              Home
            </Link>
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="px-4 py-2 rounded-xl font-semibold text-gray-700 hover:text-[#3D2F28] hover:bg-white/50 transition-all flex items-center gap-2"
              >
                <span>{feature.icon}</span>
                {feature.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <button className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-white/50 transition-all"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-[#6B7A68]/20">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-white/50 transition-all"
              >
                Home
              </Link>
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-white/50 transition-all flex items-center gap-2"
                >
                  <span>{feature.icon}</span>
                  {feature.label}
                </Link>
              ))}
              <hr className="border-gray-200/50 my-2" />
              <button className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-6 py-3 rounded-xl font-semibold text-center">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
