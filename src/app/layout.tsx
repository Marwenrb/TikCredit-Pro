import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'TikCredit Pro - تمويل احترافي',
  description: 'خدمة تمويل احترافية وسريعة - Professional financing service for Algeria',
  keywords: ['تمويل', 'قرض', 'الجزائر', 'financement', 'crédit', 'Algérie', 'TikCredit'],
  authors: [{ name: 'TikCredit Pro' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1E3A8A' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TikCredit Pro',
  },
  openGraph: {
    title: 'TikCredit Pro - تمويل احترافي',
    description: 'خدمة تمويل احترافية وسريعة',
    type: 'website',
    locale: 'ar_DZ',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

