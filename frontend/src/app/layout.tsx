import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UniversalAskBar } from '@/components/UniversalAskBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DafLegal - AI Legal Assistant',
  description: 'AI-powered legal assistant for law firms and legal professionals. Automate contract comparison, clause management, compliance checking, document drafting, and property conveyancing.',
  keywords: 'AI legal assistant, legal automation, contract comparison, compliance checker, legal drafting, conveyancing, Kenya legal tech, law firm software',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <UniversalAskBar />
      </body>
    </html>
  )
}
