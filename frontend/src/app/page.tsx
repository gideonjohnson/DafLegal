'use client'

import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      title: 'Instant Analysis',
      description: 'Upload any contract and get AI-powered risk analysis, key terms extraction, and recommendations in seconds.',
      href: '/analyze',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Timeline Builder',
      description: 'Automatically extract and visualize key dates, deadlines, and milestones from your legal documents.',
      href: '/timeline',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: 'Compare Contracts',
      description: 'Side-by-side comparison with AI-powered change detection, risk scoring, and deviation analysis.',
      href: '/compare',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: 'Clause Library',
      description: 'Build your knowledge base with categorized, searchable legal clauses and smart suggestions.',
      href: '/clauses',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      title: 'Compliance Checker',
      description: 'Automated compliance validation against custom playbooks, regulations, and industry standards.',
      href: '/compliance',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      title: 'Drafting Assistant',
      description: 'Generate professional contracts from AI-powered templates with smart clause insertion.',
      href: '/drafting',
    },
  ]

  const additionalFeatures = [
    { href: '/conveyancing', label: 'Property Conveyancing', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { href: '/research', label: 'Legal Research', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
    { href: '/citations', label: 'Citation Checker', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
    { href: '/intake', label: 'Client Intake', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ]

  return (
    <div className="min-h-screen leather-bg">
      <Navigation />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-24 pb-20">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#4a7c4a]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#b8965a]/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 glass-leather px-6 py-3 rounded-full mb-10">
            <div className="w-2 h-2 rounded-full bg-[#b8965a] animate-pulse shadow-[0_0_10px_rgba(184,150,90,0.5)]"></div>
            <span className="text-sm font-semibold text-[#1a2e1a] tracking-wide">AI-Powered Legal Intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-beige drop-shadow-lg">
              Your AI Legal Assistant
            </span>
            <br />
            <span className="gradient-text-gold">Built for Modern Lawyers</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-[#a8c4a8] mb-12 max-w-3xl mx-auto leading-relaxed">
            Automate routine legal work with AI-powered document analysis, drafting, compliance checking, and property conveyancing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Link href="/analyze" className="btn-gold text-lg">
              Start Analyzing Free
              <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button className="glass-leather px-8 py-4 rounded-xl font-semibold text-lg text-[#1a2e1a] hover:scale-105 transition-all border border-[#b8965a]/30">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#a8c4a8]">
            {['No credit card required', 'Start in 2 minutes', 'Enterprise security'].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#b8965a]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-beige mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-[#a8c4a8]">
              Powerful tools for modern legal practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="card-beige p-8 group cursor-pointer"
              >
                <div className="icon-box-3d w-16 h-16 text-[#f5edd8] mb-6 group-hover:scale-110 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#1a2e1a] mb-3 group-hover:text-[#2d5a2d] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#5c4a3d] leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-[#2d5a2d] font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Get Started</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Features Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {additionalFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass-leather rounded-xl p-5 flex items-center gap-4 group hover:scale-105 transition-all"
              >
                <div className="icon-box-3d w-12 h-12 text-[#f5edd8]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <span className="font-semibold text-[#1a2e1a] group-hover:text-[#2d5a2d]">{feature.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 text-beige">
              Trusted by Legal Professionals
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: '10x', label: 'Faster Review', desc: 'Review contracts in minutes, not hours' },
                { value: '95%', label: 'Accuracy', desc: 'AI-powered analysis you can trust' },
                { value: '24/7', label: 'Available', desc: 'Access your legal tools anytime' },
              ].map((stat) => (
                <div key={stat.label} className="stat-3d text-center">
                  <div className="text-6xl font-black mb-3 gradient-text-gold">{stat.value}</div>
                  <div className="text-xl font-semibold mb-2 text-beige">{stat.label}</div>
                  <div className="text-[#a8c4a8]">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center card-beige p-12 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2e1a] mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-[#5c4a3d] mb-10">
            Join hundreds of legal professionals using DafLegal to streamline their workflow
          </p>
          <Link href="/analyze" className="inline-block btn-gold text-lg">
            Start Free Trial
            <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-[#8b7355] mt-6">
            No credit card required &bull; Start in 2 minutes &bull; Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3d6b3d]/30 mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box-3d w-12 h-12 text-[#f5edd8]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                  </svg>
                </div>
                <span className="text-beige font-bold text-xl">DafLegal</span>
              </div>
              <p className="text-[#a8c4a8] text-sm leading-relaxed">
                AI-powered legal assistant for modern legal professionals in Kenya and beyond.
              </p>
            </div>
            <div>
              <div className="text-gold font-semibold mb-4">Features</div>
              <ul className="space-y-3 text-sm text-[#a8c4a8]">
                {['Analyze', 'Compare', 'Clauses', 'Compliance', 'Drafting'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="hover:text-beige transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-gold font-semibold mb-4">More Tools</div>
              <ul className="space-y-3 text-sm text-[#a8c4a8]">
                {['Timeline', 'Conveyancing', 'Research', 'Citations', 'Intake'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="hover:text-beige transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-gold font-semibold mb-4">Company</div>
              <ul className="space-y-3 text-sm text-[#a8c4a8]">
                {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-beige transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3d6b3d]/30 pt-8 text-center text-sm text-[#a8c4a8]">
            <p>&copy; 2025 DafLegal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
