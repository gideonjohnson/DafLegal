'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { trackButtonClick, trackCTAClick } from '@/components/Analytics'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Load Paystack from CDN
declare global {
  interface Window {
    PaystackPop: any
  }
}

const pricingTiers = [
  {
    name: 'Free',
    id: 'free',
    monthlyPrice: 0,
    annualPrice: 0,
    period: '/month',
    description: 'Try DafLegal with limited features',
    features: [
      '3 contracts per month',
      '30 pages per contract',
      'Basic AI analysis',
      'Email support (48h)',
      '7-day data retention',
      'DafLegal branding',
    ],
    cta: 'Get Started Free',
    popular: false,
    planCode: null,
  },
  {
    name: 'Basic',
    id: 'basic',
    monthlyPrice: 29,
    annualPrice: 23.20, // 20% off
    period: '/month',
    description: 'Perfect for solo practitioners and small firms',
    features: [
      '20 contracts per month',
      '50 pages per contract',
      'Full AI analysis',
      'Contract comparison',
      'Basic clause library (100 clauses)',
      'Email support (24h)',
      '30-day data retention',
    ],
    cta: 'Start Basic Plan',
    popular: false,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE_BASIC || 'PLN_ju9c70d3e2w6ckx',
  },
  {
    name: 'Pro',
    id: 'pro',
    monthlyPrice: 49,
    annualPrice: 39.20, // 20% off
    period: '/month',
    description: 'For growing firms that need more power',
    features: [
      '100 contracts per month',
      '150 pages per contract',
      'Advanced AI analysis',
      'Unlimited comparisons',
      'Full clause library (1,000+ clauses)',
      'Compliance checker',
      '3 custom playbooks',
      '2 team members',
      'Priority support (6h)',
      '90-day data retention',
      'No branding',
    ],
    cta: 'Start Pro Plan',
    popular: true,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE_PRO || 'PLN_qsdxwz1p17wbp1n',
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    monthlyPrice: 299,
    annualPrice: 239.20, // 20% off
    period: '/month',
    description: 'Tailored solutions for large organizations',
    features: [
      'Unlimited contracts',
      'Unlimited pages',
      'Priority AI processing',
      'Unlimited team members',
      'Unlimited playbooks',
      'Advanced compliance',
      'Full legal research',
      'API access',
      'White-label',
      '24/7 support',
      'Unlimited storage',
      'Dedicated account manager',
    ],
    cta: 'Start Enterprise',
    popular: false,
    planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE_ENTERPRISE || 'PLN_rrlbrmigelan0zl',
  },
]

const faqs = [
  {
    question: 'What happens after the free plan limit?',
    answer: 'The free plan gives you 3 contracts per month to try DafLegal. Once you hit the limit, you can upgrade to a paid plan to continue. No credit card required for the free plan.',
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
    answer: 'Yes! Pay annually and save 20% on all plans. For example, the Pro plan is $470.40/year (instead of $588), saving you $117.60 annually.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard), mobile money (M-Pesa, Airtel Money), and bank transfers via Paystack.',
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Yes. We offer a 30-day money-back guarantee on all paid plans. If you\'re not completely satisfied within the first 30 days, we\'ll refund your payment in full.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handlePayment = async (tier: typeof pricingTiers[0]) => {
    // Free plan - just sign up
    if (tier.id === 'free') {
      router.push('/auth/signup')
      return
    }

    // Check if user is logged in
    if (!session) {
      // Redirect to signup with plan info
      router.push(`/auth/signup?plan=${tier.id}`)
      return
    }

    // Paid plans - initialize Paystack
    setIsLoading(true)
    trackCTAClick('pricing_cta', `${tier.name} - ${isAnnual ? 'Annual' : 'Monthly'}`)

    try {
      const price = isAnnual ? tier.annualPrice : tier.monthlyPrice
      const amount = Math.round(price * 100) // Convert to cents

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Paystack
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_92ee1bde3b5480561043571077d004d6316fa283',
        email: session.user?.email || '',
        amount: amount,
        currency: 'USD',
        plan: tier.planCode,
        metadata: {
          custom_fields: [
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: tier.name
            },
            {
              display_name: 'Billing',
              variable_name: 'billing',
              value: isAnnual ? 'annual' : 'monthly'
            }
          ]
        },
        callback: function(response: any) {
          // Payment successful
          console.log('Payment successful:', response)
          alert('Payment successful! Your account has been upgraded.')
          router.push('/dashboard?payment=success')
        },
        onClose: function() {
          // User closed the modal
          setIsLoading(false)
          console.log('Payment cancelled')
        }
      })

      handler.openIframe()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initialize payment. Please try again.')
      setIsLoading(false)
    }
  }

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
            Choose the perfect plan for your firm. Start free, upgrade anytime.
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
              <span>Secure Payment via Paystack</span>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier, idx) => {
              const price = isAnnual ? tier.annualPrice : tier.monthlyPrice
              const annualTotal = tier.annualPrice ? tier.annualPrice * 12 : 0
              const monthlySavings = tier.monthlyPrice && tier.annualPrice && tier.monthlyPrice > 0
                ? ((tier.monthlyPrice - tier.annualPrice) / tier.monthlyPrice * 100).toFixed(0)
                : 0

              // Convert to KES for display
              const kesPrice = price ? Math.round(price * 130) : 0

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
                        ${price}
                      </span>
                      <span className="text-[#8b7355] dark:text-[#d4c5b0]">{tier.period}</span>
                    </div>
                    {kesPrice > 0 && (
                      <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mt-1">
                        ~KES {kesPrice.toLocaleString()}/month
                      </p>
                    )}
                    {isAnnual && annualTotal > 0 && (
                      <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0] mt-2">
                        ${annualTotal}/year • Save {monthlySavings}%
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handlePayment(tier)}
                    disabled={isLoading}
                    className={`block w-full text-center py-3 rounded-lg font-semibold mb-6 transition-all ${
                      tier.popular
                        ? 'btn-gold'
                        : 'border-2 border-[#d4a561] text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#d4a561] hover:text-white'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Processing...' : tier.cta}
                  </button>

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
              Join law firms already using DafLegal to analyze contracts faster and more accurately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handlePayment(pricingTiers[2])} // Pro plan
                className="btn-gold px-8 py-3 rounded-lg font-semibold"
              >
                Start with Pro →
              </button>
              <Link
                href="/auth/signup"
                className="border-2 border-[#d4a561] text-[#1a2e1a] dark:text-[#f5edd8] hover:bg-[#d4a561] hover:text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Try Free First
              </Link>
            </div>
            <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-6">
              Start free • Upgrade anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
