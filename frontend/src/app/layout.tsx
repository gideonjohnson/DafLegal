import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UniversalAskBar } from '@/components/UniversalAskBar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Analytics } from '@/components/Analytics'
import { LiveChat } from '@/components/LiveChat'
import { AuthProvider } from '@/components/Providers'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { SkipLink } from '@/components/SkipLink'
import { ToastContainer } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://daflegal.com'),
  title: 'DafLegal - AI Legal Assistant',
  description: 'AI-powered legal assistant for law firms and legal professionals. Automate contract comparison, clause management, compliance checking, document drafting, and property conveyancing.',
  keywords: 'AI legal assistant, legal automation, contract comparison, compliance checker, legal drafting, conveyancing, Kenya legal tech, law firm software',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DafLegal',
  },
  openGraph: {
    title: 'DafLegal - AI Legal Assistant',
    description: 'AI-powered legal assistant for modern law firms. Automate contract review, compliance checking, and legal workflows.',
    url: 'https://daflegal.com',
    siteName: 'DafLegal',
    images: [
      {
        url: '/webimg1.jpg',
        width: 1200,
        height: 630,
        alt: 'DafLegal - AI Legal Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DafLegal - AI Legal Assistant',
    description: 'AI-powered legal assistant for modern law firms',
    images: ['/webimg1.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SkipLink />
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <Analytics />
              {children}
              <UniversalAskBar />
              <LiveChat />
              <PWAInstallPrompt />
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
