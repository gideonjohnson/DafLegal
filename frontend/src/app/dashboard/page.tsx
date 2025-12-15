'use client'

import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showWelcome, setShowWelcome] = useState(true)

  // Check if user is new (you can replace this with actual logic)
  const isNewUser = !session?.user || true // For now, show to everyone

  // All 12 features organized by category
  const features = [
    {
      id: 'analyze',
      title: 'Contract Analysis',
      description: 'AI-powered contract analysis with risk detection and key terms extraction',
      href: '/analyze',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      category: 'analysis',
      color: 'from-blue-500/20 to-blue-600/20',
      badge: '2s analysis',
      popular: true
    },
    {
      id: 'timeline',
      title: 'Timeline Builder',
      description: 'Extract and visualize key dates, deadlines, and milestones automatically',
      href: '/timeline',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      category: 'analysis',
      color: 'from-purple-500/20 to-purple-600/20',
      badge: 'Auto-extract'
    },
    {
      id: 'compare',
      title: 'Contract Comparison',
      description: 'Side-by-side comparison with AI-powered change detection and risk scoring',
      href: '/compare',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      category: 'analysis',
      color: 'from-green-500/20 to-green-600/20',
      badge: 'Smart diff',
      popular: true
    },
    {
      id: 'clauses',
      title: 'Clause Library',
      description: 'Build your knowledge base with categorized, searchable legal clauses',
      href: '/clauses',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      category: 'management',
      color: 'from-amber-500/20 to-amber-600/20',
      badge: '1000+ clauses'
    },
    {
      id: 'compliance',
      title: 'Compliance Checker',
      description: 'Automated compliance validation against regulations and standards',
      href: '/compliance',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      category: 'compliance',
      color: 'from-red-500/20 to-red-600/20',
      badge: 'Real-time'
    },
    {
      id: 'drafting',
      title: 'Contract Drafting',
      description: 'Generate professional contracts from AI-powered templates',
      href: '/drafting',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      category: 'creation',
      color: 'from-indigo-500/20 to-indigo-600/20',
      badge: 'AI-powered',
      popular: true
    },
    {
      id: 'conveyancing',
      title: 'Property Conveyancing',
      description: 'Streamline property transactions with automated document generation',
      href: '/conveyancing',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      category: 'specialized',
      color: 'from-teal-500/20 to-teal-600/20',
      badge: 'Property'
    },
    {
      id: 'research',
      title: 'Legal Research',
      description: 'AI-powered legal research with case law and statute search',
      href: '/research',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      category: 'research',
      color: 'from-cyan-500/20 to-cyan-600/20',
      badge: 'AI search'
    },
    {
      id: 'citations',
      title: 'Citation Checker',
      description: 'Verify and format legal citations automatically',
      href: '/citations',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      category: 'research',
      color: 'from-pink-500/20 to-pink-600/20',
      badge: 'Auto-format'
    },
    {
      id: 'intake',
      title: 'Client Intake',
      description: 'Streamline client onboarding with smart forms and data collection',
      href: '/intake',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      category: 'management',
      color: 'from-orange-500/20 to-orange-600/20',
      badge: 'Smart forms'
    },
    {
      id: 'blog',
      title: 'Knowledge Base',
      description: 'Legal tech insights, guides, and best practices',
      href: '/blog',
      icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
      category: 'resources',
      color: 'from-violet-500/20 to-violet-600/20',
      badge: 'Learn'
    },
    {
      id: 'pricing',
      title: 'Pricing & Plans',
      description: 'Choose the perfect plan for your law firm',
      href: '/pricing',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      category: 'resources',
      color: 'from-emerald-500/20 to-emerald-600/20',
      badge: 'Plans'
    },
  ]

  const categories = [
    { id: 'all', label: 'All Features', count: features.length },
    { id: 'analysis', label: 'Analysis', count: features.filter(f => f.category === 'analysis').length },
    { id: 'compliance', label: 'Compliance', count: features.filter(f => f.category === 'compliance').length },
    { id: 'creation', label: 'Creation', count: features.filter(f => f.category === 'creation').length },
    { id: 'management', label: 'Management', count: features.filter(f => f.category === 'management').length },
    { id: 'research', label: 'Research', count: features.filter(f => f.category === 'research').length },
    { id: 'specialized', label: 'Specialized', count: features.filter(f => f.category === 'specialized').length },
    { id: 'resources', label: 'Resources', count: features.filter(f => f.category === 'resources').length },
  ]

  const filteredFeatures = activeCategory === 'all'
    ? features
    : features.filter(f => f.category === activeCategory)

  const popularFeatures = features.filter(f => f.popular)

  return (
    <>
      <Navigation />

      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/webimg1.jpg"
          alt="Dashboard Background"
          fill
          className="object-cover opacity-30"
          priority
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5edd8]/90 via-[#f5edd8]/95 to-[#f5edd8] dark:from-[#1a2e1a]/90 dark:via-[#1a2e1a]/95 dark:to-[#1a2e1a]"></div>
      </div>

      <div className="relative min-h-screen pt-20 pb-24 z-10">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Welcome/Onboarding Banner */}
          {isNewUser && showWelcome && (
            <div className="mb-8 bg-gradient-to-r from-[#2d5a2d] to-[#1a2e1a] rounded-2xl p-8 shadow-2xl border border-[#d4a561]/20 relative overflow-hidden">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-[#d4a561]/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    👋 Welcome to DafLegal{session?.user?.name && `, ${session.user.name.split(' ')[0]}`}!
                  </h2>
                  <p className="text-white/80 mb-4">
                    Get started with our most popular features or explore all 12 AI-powered tools below.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link href="/analyze" className="bg-[#d4a561] hover:bg-[#b8965a] text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
                      Start Analyzing →
                    </Link>
                    <Link href="/pricing" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold transition-all border border-white/20">
                      View Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-3">
              Your Legal Workspace
            </h1>
            <p className="text-lg text-[#8b7355] dark:text-[#d4c5b0] max-w-3xl mx-auto">
              12 AI-powered features to transform your legal workflow
            </p>
          </div>

          {/* Quick Actions - Popular Features */}
          {popularFeatures.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Most Popular
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {popularFeatures.map((feature) => (
                  <Link
                    key={feature.id}
                    href={feature.href}
                    className="group relative overflow-hidden bg-white/80 dark:bg-[#2d5a2d]/80 backdrop-blur-sm p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-[#d4a561]/30 hover:border-[#d4a561]"
                  >
                    {/* Card background image */}
                    <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Image
                        src="/webimg2.jpg"
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <svg className="w-7 h-7 text-[#1a2e1a] dark:text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                        </svg>
                      </div>
                      <span className="px-3 py-1 bg-[#d4a561] text-white text-xs font-bold rounded-full shadow-md">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2 group-hover:text-[#d4a561] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-[#d4a561] font-medium text-sm">
                      <span>Try it now</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-[#d4a561] text-white shadow-lg scale-105'
                      : 'bg-white/60 dark:bg-[#2d5a2d]/60 backdrop-blur-sm text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#d4a561]/20 border border-[#d4a561]/20'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-sm opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* All Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group bg-white/70 dark:bg-[#2d5a2d]/70 backdrop-blur-sm p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#d4a561]/10 hover:border-[#d4a561]/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <svg className="w-7 h-7 text-[#1a2e1a] dark:text-[#f5edd8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-[#d4a561]/20 text-[#d4a561] text-xs font-bold rounded-full">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2 group-hover:text-[#d4a561] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-[#d4a561] font-medium text-sm">
                  <span>Explore</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
