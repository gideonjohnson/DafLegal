import { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Pricing | DafLegal - Affordable AI Legal Assistant',
  description: 'Choose the perfect plan for your law firm. Start with a 14-day free trial. No credit card required.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
}

const pricingTiers = [
  {
    name: 'Starter',
    price: '$99',
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
    price: '$299',
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
    price: 'Custom',
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

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-[#1a2e1a] dark:text-[#f5edd8] font-medium">Monthly</span>
            <button className="relative w-14 h-7 bg-[#d4a561] rounded-full transition-colors">
              <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform"></div>
            </button>
            <span className="text-[#1a2e1a] dark:text-[#f5edd8] font-medium">
              Annual <span className="text-sm text-[#d4a561]">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => (
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
                      {tier.price}
                    </span>
                    <span className="text-[#8b7355] dark:text-[#d4c5b0]">{tier.period}</span>
                  </div>
                </div>

                <Link
                  href={tier.name === 'Enterprise' ? '/contact' : '/auth/signup'}
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
              <Link href="/auth/signup" className="btn-gold px-8 py-3 rounded-lg font-semibold">
                Start Free Trial →
              </Link>
              <Link
                href="/contact"
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
