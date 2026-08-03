import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Kufi_Arabic } from 'next/font/google'
import Script from 'next/script'
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
      <head>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1510381390785614');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${notoKufiArabic.className} antialiased`}>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }} 
            src="https://www.facebook.com/tr?id=1510381390785614&ev=PageView&noscript=1" 
            alt=""
          />
        </noscript>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

