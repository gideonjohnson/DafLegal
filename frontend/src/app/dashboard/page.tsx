import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">
              Welcome back, {session.user.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-[#8b7355] dark:text-[#d4c5b0]">
              Here's what's happening with your legal workspace
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Contracts Analyzed', value: '0', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { label: 'Active Projects', value: '0', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
              { label: 'Compliance Checks', value: '0', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Team Members', value: '1', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            ].map((stat, idx) => (
              <div key={idx} className="card-beige p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#d4a561]/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-1">{stat.value}</p>
                <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card-beige p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-6">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Analyze Contract', desc: 'Upload and analyze a new contract', href: '/analyze', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { title: 'Compare Documents', desc: 'Compare two contracts side by side', href: '/compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { title: 'Check Compliance', desc: 'Verify regulatory compliance', href: '/compliance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="p-6 border border-[#d4a561]/20 rounded-lg hover:bg-[#f5edd8]/50 dark:hover:bg-[#1a2e1a]/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#d4a561]/20 flex items-center justify-center mb-4 group-hover:bg-[#d4a561] transition-all">
                    <svg className="w-6 h-6 text-[#d4a561] group-hover:text-white transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2">{action.title}</h3>
                  <p className="text-sm text-[#8b7355] dark:text-[#d4c5b0]">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-beige p-8">
            <h2 className="text-2xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-6">
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-[#d4a561]/20 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[#8b7355] dark:text-[#d4c5b0] mb-4">
                No recent activity yet
              </p>
              <Link href="/analyze" className="btn-gold inline-block px-6 py-2 rounded-lg">
                Analyze Your First Contract
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
