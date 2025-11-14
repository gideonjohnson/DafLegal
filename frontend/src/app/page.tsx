'use client'

import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: '⚖️',
      title: 'Compare Contracts',
      description: 'Side-by-side comparison with AI-powered change detection and risk analysis',
      href: '/compare',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: '📋',
      title: 'Clause Library',
      description: 'Build your knowledge base with categorized, searchable legal clauses',
      href: '/clauses',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: '✓',
      title: 'Compliance Checker',
      description: 'Automated compliance validation against custom playbooks and rules',
      href: '/compliance',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: '✍️',
      title: 'Drafting Assistant',
      description: 'Generate professional contracts from AI-powered templates',
      href: '/drafting',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: '🏡',
      title: 'Property Conveyancing',
      description: 'Manage property transactions in Kenya with intelligent tracking',
      href: '/conveyancing',
      gradient: 'from-teal-500 to-teal-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-8">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#526450] to-[#6B7A68] animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">AI-Powered Legal Intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#3D2F28] to-[#526450] bg-clip-text text-transparent">
              Your AI Legal Assistant
            </span>
            <br />
            <span className="text-gray-800">Built for Modern Lawyers</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Automate routine legal work with AI-powered document comparison, drafting, compliance checking, and property conveyancing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/compare"
              className="btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all"
            >
              Get Started Free →
            </Link>
            <button className="glass px-8 py-4 rounded-xl font-semibold text-lg text-gray-800 hover:bg-white/80 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#526450]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#526450]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Start in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#526450]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Enterprise security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools for modern legal practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass rounded-3xl p-8 hover:shadow-2xl transition-all group cursor-pointer"
              >
                <div className={`icon-3d bg-gradient-to-r ${feature.gradient} text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#3D2F28] mb-3 group-hover:text-[#526450] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-[#526450] font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Explore</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[#3D2F28] via-[#526450] to-[#6B7A68]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
              Trusted by Legal Professionals
            </h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-3">10x</div>
                <div className="text-xl font-semibold mb-2">Faster Review</div>
                <div className="text-gray-200">
                  Review contracts in minutes, not hours
                </div>
              </div>
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-3">95%</div>
                <div className="text-xl font-semibold mb-2">Accuracy</div>
                <div className="text-gray-200">
                  AI-powered analysis you can trust
                </div>
              </div>
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-3">24/7</div>
                <div className="text-xl font-semibold mb-2">Available</div>
                <div className="text-gray-200">
                  Access your legal tools anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of legal professionals using DafLegal to streamline their workflow
          </p>
          <Link
            href="/compare"
            className="inline-block btn-3d bg-gradient-to-r from-[#3D2F28] to-[#526450] text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all"
          >
            Start Free Trial →
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Start in 2 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚖️</span>
                <span className="text-white font-bold text-lg">DafLegal</span>
              </div>
              <p className="text-sm">
                AI-powered legal assistant for modern legal professionals.
              </p>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Features</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compare" className="hover:text-white transition-colors">Compare</Link></li>
                <li><Link href="/clauses" className="hover:text-white transition-colors">Clauses</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
                <li><Link href="/drafting" className="hover:text-white transition-colors">Drafting</Link></li>
                <li><Link href="/conveyancing" className="hover:text-white transition-colors">Property</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-4">Support</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="mailto:support@daflegal.com" className="hover:text-white transition-colors">Email Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 DafLegal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
