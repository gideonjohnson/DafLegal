'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { trackButtonClick, trackCTAClick } from '@/components/Analytics'

const pricingTiers = [
  {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 79, // 20% off
    period: '/month',
    description: 'Perfect for solo practitioners and small firms',
    features: [
      '50 contract analyses per month',
      'Basic clause extraction',
      'Compliance checking',
      'Email support',
      '5 GB storage',
      'Single user',
      'Mobile access',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 299,
    annualPrice: 239, // 20% off
    period: '/month',
    description: 'For growing firms that need more power',
    features: [
      '500 contract analyses per month',
      'Advanced AI analysis',
      'Custom clause libraries',
      'Priority support',
      '50 GB storage',
      'Up to 10 users',
      'Mobile & desktop apps',
      'API access',
      'Custom workflows',
      'Bulk processing',
      'White-label reports',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    period: '',
    description: 'Tailored solutions for large organizations',
    features: [
      'Unlimited contract analyses',
      'Custom AI training',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited storage',
      'Unlimited users',
      'All platforms',
      'Advanced API',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment',
      'Security audit support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const addOns = [
  { name: 'Additional User', price: 30, period: '/user/month' },
  { name: 'Extra Storage (10GB)', price: 10, period: '/month' },
  { name: 'Premium Support', price: 99, period: '/month' },
  { name: 'Custom AI Model Training', price: 499, period: '/one-time' },
]

const trustedBy = [
  'Dentons',
  'Baker McKenzie',
  'Latham & Watkins',
  'Clifford Chance',
  'Linklaters',
  'Freshfields',
]

const faqs = [
  {
    question: 'What happens after the 14-day free trial?',
    answer: 'Your trial includes full access to all Professional plan features. After 14 days, you can choose to upgrade to a paid plan or downgrade to our free tier with limited features. No credit card required to start.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at the end of your current billing cycle.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level AES-256 encryption for all data. Your contracts are stored securely and are never used to train our AI models. We\'re SOC 2 Type II certified and GDPR compliant.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Pay annually and save 20% on all plans. For example, the Professional plan is $2,870/year (instead of $3,588), saving you $718 annually.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers for annual plans, and can invoice larger organizations. Enterprise plans can be customized to your payment preferences.',
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Yes. We offer a 30-day money-back guarantee on all paid plans. If you\'re not completely satisfied within the first 30 days, we\'ll refund your payment in full.',
  },
  {
    question: 'How does user licensing work?',
    answer: 'Each plan includes a set number of user seats. Additional users can be added for $30/month per user on the Professional plan. Enterprise plans include unlimited users.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'Starter plans include email support (24-hour response time). Professional plans get priority email support (4-hour response). Enterprise customers get 24/7 phone support and a dedicated account manager.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [roiHours, setRoiHours] = useState(10)

  const handlePricingClick = (planName: string, isAnnual: boolean) => {
    trackCTAClick('pricing_cta', `${planName} - ${isAnnual ? 'Annual' : 'Monthly'}`)
  }

  const calculateSavings = () => {
    const hourlyRate = 150 // Average lawyer hourly rate
    const monthlySavings = roiHours * hourlyRate * 4 // 4 weeks
    const yearlySavings = monthlySavings * 12
    return { monthly: monthlySavings, yearly: yearlySavings }
  }

  const savings = calculateSavings()

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-20 pb-16">
        {/* Header */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#8b7355] dark:text-[#d4c5b0] max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your firm. Start with a 14-day free trial. No credit card required.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-[#8b7355] dark:text-[#d4c5b0]">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8b7355] dark:text-[#d4c5b0]">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>SOC 2 Certified</span>
            </div>
          </div>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-[#1a2e1a] dark:text-[#f5edd8] font-medium ${!isAnnual ? 'text-[#d4a561]' : ''}`}>
              Monthly
            </span>
            <button
              onClick={() => {
                setIsAnnual(!isAnnual)
                trackButtonClick('billing_toggle', isAnnual ? 'monthly' : 'annual')
              }}
              className="relative w-14 h-7 bg-[#d4a561] rounded-full transition-colors"
              aria-label="Toggle annual/monthly billing"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              ></div>
            </button>
            <span className={`text-[#1a2e1a] dark:text-[#f5edd8] font-medium ${isAnnual ? 'text-[#d4a561]' : ''}`}>
              Annual <span className="text-sm text-green-600 dark:text-green-400 font-bold">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => {
              const price = tier.monthlyPrice
                ? isAnnual
                  ? tier.annualPrice
                  : tier.monthlyPrice
                : null
              const annualTotal = tier.annualPrice ? tier.annualPrice * 12 : null
              const monthlySavings = tier.monthlyPrice && tier.annualPrice
                ? ((tier.monthlyPrice - tier.annualPrice) / tier.monthlyPrice * 100).toFixed(0)
                : 0

              return (
                <div
                  key={idx}
                  className={`card-beige p-8 relative ${
                    tier.popular ? 'ring-2 ring-[#d4a561] shadow-2xl scale-105' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4a561] text-white px-6 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-4">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
                        {price ? `$${price}` : 'Custom'}
                      </span>
                      <span className="text-[#8b7355] dark:text-[#d4c5b0]">{tier.period}</span>
                    </div>
                    {isAnnual && annualTotal && (
                      <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                        ${annualTotal}/year • Save {monthlySavings}%
                      </p>
                    )}
                  </div>

                  <Link
                    href={tier.name === 'Enterprise' ? '/contact' : '/auth/signup'}
                    onClick={() => handlePricingClick(tier.name, isAnnual)}
                    className={`block w-full text-center py-3 rounded-lg font-semibold mb-6 transition-all ${
                      tier.popular
                        ? 'btn-gold'
                        : 'border-2 border-[#d4a561] text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#d4a561] hover:text-white'
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  <div className="space-y-3">
                    {tier.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-[#d4a561] flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-[#1a2e1a] dark:text-[#f5edd8]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="container mx-auto px-4 mb-16">
          <div className="card-beige p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] text-center mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-center text-[#8b7355] dark:text-[#d4c5b0] mb-8">
              See how much time and money you can save with DafLegal
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                Hours saved per week on contract review:
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={roiHours}
                onChange={(e) => setRoiHours(parseInt(e.target.value))}
                className="w-full h-2 bg-[#d4a561]/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                <span>1 hour</span>
                <span className="font-bold text-[#d4a561]">{roiHours} hours</span>
                <span>40 hours</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#d4a561]/10 to-[#2d5a2d]/10 p-6 rounded-lg">
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-2">Monthly Savings</p>
                <p className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
                  ${savings.monthly.toLocaleString()}
                </p>
                <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                  Based on $150/hr lawyer rate
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#d4a561]/10 to-[#2d5a2d]/10 p-6 rounded-lg">
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-2">Annual Savings</p>
                <p className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8]">
                  ${savings.yearly.toLocaleString()}
                </p>
                <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                  ROI: {((savings.yearly / (299 * 12)) * 100).toFixed(0)}x return
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                <strong>DafLegal pays for itself in less than a week!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Trusted By */}
        <div className="container mx-auto px-4 mb-16">
          <p className="text-center text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-6">
            Trusted by leading law firms worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {trustedBy.map((company, idx) => (
              <div
                key={idx}
                className="text-lg font-semibold text-[#1a2e1a] dark:text-[#f5edd8]"
              >
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] text-center mb-8">
            Optional Add-ons
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {addOns.map((addon, idx) => (
              <div key={idx} className="card-beige p-6 text-center">
                <h3 className="font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
                  {addon.name}
                </h3>
                <p className="text-2xl font-bold text-[#d4a561] mb-1">${addon.price}</p>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">{addon.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] text-center mb-8">
            Compare All Features
          </h2>
          <div className="card-beige overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4a561]/20">
                  <th className="text-left p-4 text-[#1a2e1a] dark:text-[#f5edd8]">Feature</th>
                  <th className="text-center p-4 text-[#1a2e1a] dark:text-[#f5edd8]">Starter</th>
                  <th className="text-center p-4 text-[#1a2e1a] dark:text-[#f5edd8]">Professional</th>
                  <th className="text-center p-4 text-[#1a2e1a] dark:text-[#f5edd8]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Contract Analyses', starter: '50/mo', pro: '500/mo', enterprise: 'Unlimited' },
                  { feature: 'Users', starter: '1', pro: '10', enterprise: 'Unlimited' },
                  { feature: 'Storage', starter: '5 GB', pro: '50 GB', enterprise: 'Unlimited' },
                  { feature: 'AI Clause Extraction', starter: '✓', pro: '✓', enterprise: '✓' },
                  { feature: 'Compliance Checking', starter: '✓', pro: '✓', enterprise: '✓' },
                  { feature: 'Custom Clause Libraries', starter: '—', pro: '✓', enterprise: '✓' },
                  { feature: 'Bulk Processing', starter: '—', pro: '✓', enterprise: '✓' },
                  { feature: 'White-label Reports', starter: '—', pro: '✓', enterprise: '✓' },
                  { feature: 'Custom AI Training', starter: '—', pro: '—', enterprise: '✓' },
                  { feature: 'On-premise Deployment', starter: '—', pro: '—', enterprise: '✓' },
                  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 Phone' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-[#d4a561]/10">
                    <td className="p-4 text-[#1a2e1a] dark:text-[#f5edd8]">{row.feature}</td>
                    <td className="p-4 text-center text-[#8b7355] dark:text-[#d4c5b0]">{row.starter}</td>
                    <td className="p-4 text-center text-[#8b7355] dark:text-[#d4c5b0]">{row.pro}</td>
                    <td className="p-4 text-center text-[#8b7355] dark:text-[#d4c5b0]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="card-beige p-6 group">
                <summary className="font-semibold text-[#1a2e1a] dark:text-[#f5edd8] cursor-pointer flex items-center justify-between">
                  {faq.question}
                  <svg
                    className="w-5 h-5 text-[#d4a561] transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-[#8b7355] dark:text-[#d4c5b0] text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="container mx-auto px-4">
          <div className="card-beige p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4">
              Ready to transform your legal workflow?
            </h2>
            <p className="text-[#8b7355] dark:text-[#d4c5b0] mb-8">
              Join hundreds of law firms already using DafLegal to analyze contracts faster and more accurately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                onClick={() => trackCTAClick('final_cta', 'Start Free Trial')}
                className="btn-gold px-8 py-3 rounded-lg font-semibold"
              >
                Start Free Trial →
              </Link>
              <Link
                href="/contact"
                onClick={() => trackCTAClick('final_cta', 'Contact Sales')}
                className="border-2 border-[#d4a561] text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#d4a561] hover:text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Contact Sales
              </Link>
            </div>
            <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-6">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
