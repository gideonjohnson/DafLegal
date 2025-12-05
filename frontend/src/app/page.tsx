'use client'

import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsAnimated, setStatsAnimated] = useState(false)

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
      color: 'from-blue-500/20 to-blue-600/20',
      highlight: '2s analysis'
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
      color: 'from-purple-500/20 to-purple-600/20',
      highlight: 'Auto-extract dates'
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
      color: 'from-green-500/20 to-green-600/20',
      highlight: 'Smart diff'
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
      color: 'from-amber-500/20 to-amber-600/20',
      highlight: '1000+ clauses'
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
      color: 'from-red-500/20 to-red-600/20',
      highlight: 'Real-time check'
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
      color: 'from-indigo-500/20 to-indigo-600/20',
      highlight: 'AI-powered'
    },
  ]

  const additionalFeatures = [
    { href: '/conveyancing', label: 'Property Conveyancing', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { href: '/research', label: 'Legal Research', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
    { href: '/citations', label: 'Citation Checker', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
    { href: '/intake', label: 'Client Intake', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ]

  const testimonials = [
    {
      name: 'Sarah Kimani',
      role: 'Partner, Kimani & Associates',
      company: 'Law Firm',
      image: '👩‍💼',
      quote: 'DafLegal has reduced our contract review time by 80%. The AI insights are incredibly accurate and save us hours of manual work.',
      rating: 5,
      metric: '80% time saved',
      caseStudy: 'Reviewed 200+ contracts in first month'
    },
    {
      name: 'David Ochieng',
      role: 'Corporate Counsel, Tech Startup',
      company: 'Technology',
      image: '👨‍💼',
      quote: 'The compliance checker is a game-changer. It catches regulatory issues we might have missed and gives us peace of mind.',
      rating: 5,
      metric: 'Zero compliance issues',
      caseStudy: 'Prevented 3 major legal risks'
    },
    {
      name: 'Grace Wanjiku',
      role: 'Solo Practitioner',
      company: 'Independent',
      image: '👩‍⚖️',
      quote: 'As a solo practitioner, DafLegal is like having a team of associates. The drafting assistant alone pays for itself.',
      rating: 5,
      metric: '5x client capacity',
      caseStudy: 'Handles 5x more clients alone'
    }
  ]

  const faqs = [
    {
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI achieves 95%+ accuracy by combining GPT-4 with specialized legal models trained on thousands of contracts. Every analysis is backed by specific clause references and reasoning.'
    },
    {
      question: 'Is my data secure and confidential?',
      answer: 'Absolutely. We use enterprise-grade encryption (AES-256), comply with GDPR and data protection laws, and never train our models on your data. Your documents remain completely confidential.'
    },
    {
      question: 'Can I customize the compliance playbooks?',
      answer: 'Yes! You can create custom playbooks tailored to your jurisdiction, practice area, and specific requirements. We also provide pre-built templates for common use cases.'
    },
    {
      question: 'What file formats do you support?',
      answer: 'We support PDF, DOCX, DOC, TXT, and RTF files. Our OCR technology can even extract text from scanned documents with high accuracy.'
    },
    {
      question: 'Do you offer API access?',
      answer: 'Yes, enterprise plans include full API access so you can integrate DafLegal into your existing workflows, case management systems, or custom applications.'
    }
  ]

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Stats counter animation
  useEffect(() => {
    if (!statsRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [statsAnimated])

  // Testimonial auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterStatus('loading')

    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success')
      setEmail('')
      setTimeout(() => setNewsletterStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <div className="min-h-screen leather-bg">
      <Navigation />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-16 pb-12 scroll-animate overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/webimg1.jpg"
            alt="Legal Technology Background"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a]/80 via-[#1a2e1a]/60 to-[#1a2e1a]/90"></div>
        </div>

        {/* Decorative elements with parallax */}
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-[#4a7c4a]/10 rounded-full blur-3xl z-0"
          style={{ transform: `translateY(${typeof window !== 'undefined' ? window.scrollY * 0.3 : 0}px)` }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#b8965a]/5 rounded-full blur-3xl z-0"
          style={{ transform: `translateY(${typeof window !== 'undefined' ? window.scrollY * 0.2 : 0}px)` }}
        ></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 glass-leather px-4 py-2 rounded-full mb-6 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b8965a] animate-pulse shadow-[0_0_8px_rgba(184,150,90,0.5)]"></div>
            <span className="text-xs font-semibold text-[#1a2e1a] tracking-wide">AI-Powered Legal Intelligence</span>
          </div>

          {/* Main Headline with typing effect */}
          <h1 className="text-xl md:text-3xl font-bold mb-4 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-beige drop-shadow-lg">
              Your AI Legal Assistant
            </span>
            <br />
            <span className="gradient-text-gold">Built for Modern Lawyers</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm md:text-base text-[#c4d4c4] mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Automate routine legal work with AI-powered document analysis, drafting, compliance checking, and property conveyancing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link href="/analyze" className="btn-gold text-sm group px-5 py-2.5">
              Start Analyzing Free
              <svg className="inline-block w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={() => setShowVideoModal(true)}
              className="glass-leather px-5 py-2.5 rounded-xl font-semibold text-sm text-[#1a2e1a] hover:scale-105 transition-all border border-[#b8965a]/30 group"
            >
              <svg className="inline-block w-3.5 h-3.5 mr-1.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#c4d4c4] animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            {['No credit card required', 'Start in 2 minutes', 'Enterprise security'].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-2xl md:text-3xl font-bold text-beige mb-3">
                How It Works
              </h2>
              <p className="text-base text-[#c4d4c4] max-w-2xl mx-auto">
                Get started in minutes with our simple 3-step process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-[#d4a561] via-[#d4a561] to-[#d4a561] opacity-30"></div>

              {[
                {
                  step: '01',
                  title: 'Upload Document',
                  description: 'Drag & drop your contract or legal document in any format - PDF, DOCX, or TXT.',
                  icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
                  color: 'from-blue-500/20 to-blue-600/20'
                },
                {
                  step: '02',
                  title: 'AI Analysis',
                  description: 'Our AI extracts key clauses, identifies risks, and provides compliance insights in seconds.',
                  icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  color: 'from-purple-500/20 to-purple-600/20'
                },
                {
                  step: '03',
                  title: 'Get Results',
                  description: 'Review comprehensive analysis, export reports, and take action with AI-powered recommendations.',
                  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                  color: 'from-green-500/20 to-green-600/20'
                }
              ].map((item, index) => (
                <div key={item.step} className="scroll-animate" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="card-beige p-6 text-center relative group hover:scale-105 transition-all duration-300">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#e8c589] to-[#d4a561] flex items-center justify-center shadow-lg">
                      <span className="text-[#1a2e1a] font-black text-xs">{item.step}</span>
                    </div>

                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>

                    <div className="relative z-10 mt-4">
                      <div className="icon-box-3d w-14 h-14 mx-auto mb-4 text-[#f5edd8] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-[#1a2e1a] mb-3">{item.title}</h3>
                      <p className="text-sm text-[#5c4a3d] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-8 scroll-animate">
              <Link href="/analyze" className="btn-gold text-base inline-flex items-center gap-2 group">
                Try It Now - It's Free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className="text-2xl md:text-3xl font-bold text-beige mb-3">
              Everything You Need
            </h2>
            <p className="text-base text-[#c4d4c4]">
              Powerful tools for modern legal practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="card-beige p-6 group cursor-pointer relative overflow-hidden scroll-animate"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Badge */}
                <div className="absolute top-3 right-3 bg-[#b8965a]/20 text-[#8b7355] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {feature.highlight}
                </div>

                <div className="relative z-10">
                  <div className="icon-box-3d w-12 h-12 text-[#f5edd8] mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1a2e1a] mb-2 group-hover:text-[#2d5a2d] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#5c4a3d] leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm text-[#2d5a2d] font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Features Row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 scroll-animate">
            {additionalFeatures.map((feature, index) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass-leather rounded-xl p-5 flex items-center gap-4 group hover:scale-105 transition-all"
                style={{ animationDelay: `${(index + 6) * 0.1}s` }}
              >
                <div className="icon-box-3d w-12 h-12 text-[#f5edd8] group-hover:rotate-12 transition-transform duration-300">
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

      {/* Stats Section with Counter Animation */}
      <section className="py-16 scroll-animate" ref={statsRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-beige">
              Trusted by Legal Professionals
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { value: '500+', label: 'Law Firms', desc: 'Trust our platform' },
                { value: '10,000+', label: 'Contracts', desc: 'Analyzed monthly' },
                { value: '95%', label: 'Accuracy', desc: 'AI-powered analysis' },
                { value: '10x', label: 'Faster', desc: 'Review in minutes' },
              ].map((stat, index) => (
                <div key={stat.label} className="stat-3d text-center group hover:scale-105 transition-transform" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className={`text-3xl md:text-4xl font-black mb-2 gradient-text-gold ${statsAnimated ? 'animate-counter' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-base font-semibold mb-1 text-beige">{stat.label}</div>
                  <div className="text-sm text-[#c4d4c4]">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-2xl md:text-3xl font-bold text-beige mb-3">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base text-[#c4d4c4]">
                Choose the plan that fits your needs. All plans include 14-day free trial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter',
                  price: '$29',
                  period: '/month',
                  description: 'Perfect for solo practitioners',
                  features: [
                    '10 contract analyses/month',
                    'Basic compliance checking',
                    'Clause library access',
                    'Email support',
                    'Export to PDF'
                  ],
                  cta: 'Start Free Trial',
                  highlight: false
                },
                {
                  name: 'Professional',
                  price: '$49',
                  period: '/month',
                  description: 'For growing legal teams',
                  features: [
                    'Unlimited contract analyses',
                    'Advanced compliance playbooks',
                    'Document comparison',
                    'Priority support',
                    'API access',
                    'Custom templates'
                  ],
                  cta: 'Start Free Trial',
                  highlight: true,
                  badge: 'Most Popular'
                },
                {
                  name: 'Enterprise',
                  price: '$99',
                  period: '/month',
                  description: 'For large firms and corporations',
                  features: [
                    'Everything in Professional',
                    'Unlimited team members',
                    'Custom integrations',
                    'Dedicated account manager',
                    'SLA guarantee',
                    'Advanced analytics'
                  ],
                  cta: 'Contact Sales',
                  highlight: false
                }
              ].map((plan, index) => (
                <div
                  key={plan.name}
                  className={`scroll-animate ${plan.highlight ? 'md:-mt-4 md:mb-4' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className={`card-beige p-6 relative ${plan.highlight ? 'border-3 border-[#d4a561] shadow-2xl' : ''} group hover:scale-105 transition-all duration-300`}>
                    {/* Most Popular Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#e8c589] to-[#d4a561] text-[#1a2e1a] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {plan.badge}
                      </div>
                    )}

                    <div className={plan.badge ? 'mt-3' : ''}>
                      <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">{plan.name}</h3>
                      <p className="text-[#5c4a3d] text-xs mb-4">{plan.description}</p>

                      <div className="mb-4">
                        <span className="text-3xl font-black text-[#1a2e1a]">{plan.price}</span>
                        <span className="text-sm text-[#5c4a3d]">{plan.period}</span>
                      </div>

                      <Link
                        href="/analyze"
                        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 mb-4 ${
                          plan.highlight
                            ? 'btn-gold'
                            : 'glass-leather text-[#1a2e1a] hover:bg-[#3d6b3d]/10 border-2 border-[#d4a561]/30'
                        }`}
                      >
                        {plan.cta}
                      </Link>

                      <div className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-[#d4a561] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[#5c4a3d] text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 scroll-animate">
              <p className="text-sm text-[#c4d4c4] mb-3">All plans include 14-day free trial • No credit card required • Cancel anytime</p>
              <Link href="/analyze" className="text-sm text-[#d4a561] hover:text-[#e8c589] font-semibold transition-colors">
                Compare all features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-2xl md:text-3xl font-bold text-beige mb-3">
                Enterprise-Grade Security
              </h2>
              <p className="text-base text-[#c4d4c4]">
                Your data security and confidentiality is our top priority
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                  title: 'AES-256 Encryption',
                  description: 'Military-grade encryption for all data at rest and in transit'
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'GDPR Compliant',
                  description: 'Full compliance with data protection regulations'
                },
                {
                  icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
                  title: 'ISO 27001 Certified',
                  description: 'International standard for information security'
                },
                {
                  icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
                  title: 'Confidential',
                  description: 'We never train AI models on your documents'
                }
              ].map((item, index) => (
                <div key={item.title} className="scroll-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-beige p-5 text-center group hover:scale-105 transition-all duration-300">
                    <div className="icon-box-3d w-12 h-12 mx-auto mb-3 text-[#f5edd8] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-[#1a2e1a] mb-2">{item.title}</h4>
                    <p className="text-xs text-[#5c4a3d]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 scroll-animate">
              <div className="card-beige p-6 text-center">
                <h3 className="text-lg font-bold text-[#1a2e1a] mb-4">Additional Security Features</h3>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  {[
                    { label: 'Two-Factor Authentication', icon: '✓' },
                    { label: 'Role-Based Access Control', icon: '✓' },
                    { label: 'Audit Logs & Monitoring', icon: '✓' },
                    { label: 'Regular Security Audits', icon: '✓' },
                    { label: 'Data Backup & Recovery', icon: '✓' },
                    { label: 'SOC 2 Type II Compliance', icon: '✓' }
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2">
                      <span className="text-[#d4a561] text-base font-bold">{feature.icon}</span>
                      <span className="text-xs text-[#5c4a3d]">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel - Enhanced */}
      <section className="container mx-auto px-4 py-16 scroll-animate">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-3 text-beige">
            What Our Clients Say
          </h3>
          <p className="text-center text-sm text-[#c4d4c4] mb-12">Join 500+ legal professionals who trust DafLegal</p>

          <div className="relative">
            <div className="card-beige p-6 md:p-8 relative overflow-hidden">
              {/* Quote Icon */}
              <svg className="absolute top-4 right-4 w-12 h-12 text-[#d4a561] opacity-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonials[activeTestimonial].image}</div>
                    <div>
                      <div className="font-bold text-base text-[#1a2e1a]">{testimonials[activeTestimonial].name}</div>
                      <div className="text-sm text-[#5c4a3d]">{testimonials[activeTestimonial].role}</div>
                      <div className="text-xs text-[#8b7355]">{testimonials[activeTestimonial].company}</div>
                    </div>
                  </div>
                  <div className="md:ml-auto flex flex-col items-start md:items-end gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-[#d4a561]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="bg-[#d4a561]/20 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#1a2e1a]">
                      {testimonials[activeTestimonial].metric}
                    </div>
                  </div>
                </div>

                <p className="text-base text-[#5c4a3d] italic leading-relaxed mb-3">
                  "{testimonials[activeTestimonial].quote}"
                </p>

                <div className="flex items-center gap-1.5 text-xs text-[#8b7355]">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{testimonials[activeTestimonial].caseStudy}</span>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-[#d4a561] w-8' : 'bg-[#d4a561]/30 w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Verified Reviews', value: '4.9/5.0', icon: '⭐' },
              { label: 'Active Users', value: '2,000+', icon: '👥' },
              { label: 'Success Rate', value: '99.8%', icon: '✓' },
              { label: 'Uptime', value: '99.9%', icon: '⚡' }
            ].map((badge) => (
              <div key={badge.label} className="text-center">
                <div className="text-2xl mb-1.5">{badge.icon}</div>
                <div className="text-lg font-bold text-[#d4a561]">{badge.value}</div>
                <div className="text-xs text-[#c4d4c4]">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Image Section */}
      <section className="container mx-auto px-4 py-16 scroll-animate">
        <div className="max-w-6xl mx-auto">
          <div className="card-beige p-6 md:p-8 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1a2e1a] mb-4">
                  Modern AI-Powered Legal Technology
                </h3>
                <p className="text-base text-[#5c4a3d] mb-6 leading-relaxed">
                  Experience the future of legal work with our cutting-edge AI platform.
                  Streamline your practice with intelligent document analysis, automated compliance checking,
                  and powerful legal research tools designed specifically for modern law firms.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: '🚀', text: 'Lightning-fast document processing' },
                    { icon: '🎯', text: 'Precision AI analysis and insights' },
                    { icon: '🔒', text: 'Enterprise-grade security' },
                    { icon: '📊', text: 'Comprehensive analytics dashboard' }
                  ].map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-sm text-[#1a2e1a] font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 relative">
                <div className="relative rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <Image
                    src="/webimg.webp"
                    alt="DafLegal Platform Interface"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 scroll-animate">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-beige">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="card-beige overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-[#3d6b3d]/5 transition-colors"
                >
                  <span className="font-semibold text-sm text-[#1a2e1a]">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-[#b8965a] transition-transform flex-shrink-0 ml-2 ${
                      activeFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-4 pb-4 text-xs text-[#5c4a3d] animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-16 scroll-animate">
        <div className="max-w-2xl mx-auto text-center card-beige p-6">
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-3">
            Stay Updated
          </h3>
          <p className="text-sm text-[#5c4a3d] mb-5">
            Get the latest legal tech insights, product updates, and exclusive tips delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={newsletterStatus === 'loading'}
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border-2 border-[#b8965a]/30 focus:border-[#b8965a] outline-none bg-white/50 text-[#1a2e1a] placeholder:text-[#8b7355]"
            />
            <button
              type="submit"
              disabled={newsletterStatus === 'loading'}
              className="btn-gold text-sm whitespace-nowrap disabled:opacity-50 px-6 py-2.5"
            >
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {newsletterStatus === 'success' && (
            <div className="mt-3 text-sm text-green-600 font-semibold animate-fade-in">
              Thanks for subscribing! Check your inbox.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 scroll-animate">
        <div className="max-w-4xl mx-auto text-center card-beige p-8 md:p-10 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#b8965a]/5 to-[#4a7c4a]/5 animate-gradient"></div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a2e1a] mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-base text-[#5c4a3d] mb-6">
              Join hundreds of legal professionals using DafLegal to streamline their workflow
            </p>
            <Link href="/analyze" className="inline-block btn-gold text-base group">
              Start Free Trial
              <svg className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-xs text-[#8b7355] mt-4">
              No credit card required &bull; Start in 2 minutes &bull; Cancel anytime
            </p>
          </div>
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

      {/* Video Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1a2e1a] rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video placeholder - replace with actual video embed */}
            <div className="aspect-video bg-[#2d5a2d] flex items-center justify-center">
              <div className="text-center text-[#a8c4a8]">
                <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                <p className="text-xl font-semibold mb-2">Demo Video</p>
                <p className="text-sm">Coming soon! See DafLegal in action.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 flex items-center justify-center btn-gold rounded-full shadow-lg hover:scale-110 transition-all animate-fade-in"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-counter {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .scroll-animate.animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
