import { IntakeDashboard } from '@/components/IntakeDashboard'

export default function IntakeDashboardPage() {
  // In production, you'd get the API key from auth context/session
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <IntakeDashboard apiKey={apiKey} />
    </main>
  )
}
