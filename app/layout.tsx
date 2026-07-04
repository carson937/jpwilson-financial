import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ScrollRevealInit from '@/components/ScrollRevealInit'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://jpwilsonfinancial.com'),
  title: 'JP Wilson Financial Group | Independent Insurance Advisors',
  description:
    'JP Wilson Financial Group — licensed independent insurance advisors comparing 30+ carriers. Medicare, life, business, auto, and home coverage. No-obligation quotes. Serving SC & NC.',
  keywords:
    'insurance broker, Medicare insurance, life insurance, business insurance, independent insurance agent, South Carolina, North Carolina',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/og-image.png',
  },
  openGraph: {
    title: 'JP Wilson Financial Group | Independent Insurance Advisors',
    description:
      'Licensed independent advisors comparing 30+ top carriers. Medicare, life, business, auto, and home coverage. No cost. No obligation.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1024, height: 1024, alt: 'JP Wilson Financial Group' }],
  },
  twitter: {
    card: 'summary',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ScrollRevealInit />
        {children}
      </body>
    </html>
  )
}
