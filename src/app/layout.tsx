import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Kufi_Arabic } from 'next/font/google'
import './globals.css'
import './print-styles.css'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TikCredit Pro — منصة التمويل الرائدة في الجزائر',
  description: 'قدّم طلب تمويلك الشخصي أو التجاري بسرعة وأمان. TikCredit Pro: الحل الأسرع للحصول على قرض في الجزائر.',
  keywords: 'قرض الجزائر, تمويل شخصي, تمويل تجاري, tikcredit, credit algerie, قرض سريع',
  authors: [{ name: 'TikCredit Pro' }],
  robots: { index: true, follow: true },
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
    title: 'TikCredit Pro — منصة التمويل الرائدة في الجزائر',
    description: 'قدّم طلب تمويلك الشخصي أو التجاري بسرعة وأمان. TikCredit Pro: الحل الأسرع للحصول على قرض في الجزائر.',
    type: 'website',
    locale: 'ar_DZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TikCredit Pro',
    description: 'قدّم طلب تمويلك في الجزائر بسرعة وأمان.',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
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
    <html lang="ar" dir="rtl" className={`${inter.variable} ${notoKufiArabic.variable}`}>
      <body className={`${notoKufiArabic.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

