import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { licensedStateNames } from '@/lib/licensedStates'
import './globals.css'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import Analytics from '@/components/Analytics'

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
  title: 'Patrick Wilson Financial | Independent Insurance Advisor',
  description:
    'Patrick Wilson Financial helps individuals, families, and businesses compare health, Medicare, life, business, auto, and home insurance options. Licensed in North Carolina, South Carolina, Georgia, and Tennessee. Office in Charlotte, NC.',
  keywords:
    'insurance broker, health insurance, Medicare insurance, life insurance, business insurance, general liability, workers compensation, independent insurance agent, Charlotte NC insurance, North Carolina, South Carolina, Georgia, Tennessee',
  // Official brand marks (intake 2026-07-29-official-logos).
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Patrick Wilson Financial | Independent Insurance Advisor',
    description:
      'Independent insurance guidance for health, Medicare, life, business, auto, and home coverage. Licensed in NC, SC, GA, and TN.',
    type: 'website',
    url: '/',
    siteName: 'Patrick Wilson Financial',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Patrick Wilson Financial' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patrick Wilson Financial | Independent Insurance Advisor',
    description:
      'Independent insurance guidance for health, Medicare, life, business, auto, and home coverage. Licensed in NC, SC, GA, and TN.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
}

/**
 * `viewportFit: 'cover'` is what makes `env(safe-area-inset-*)` resolve to a
 * non-zero value on notched iPhones. Without it every safe-area rule in the
 * stylesheet silently computes to 0 and the sticky CTA sits under the home
 * indicator.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F1EA' },
    { media: '(prefers-color-scheme: dark)', color: '#070F1C' },
  ],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'InsuranceAgency',
  name: 'Patrick Wilson Financial',
  url: 'https://jpwilsonfinancial.com',
  telephone: '+1-866-786-1585',
  email: 'contact@jpwilsonfinancial.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1200 The Plaza',
    addressLocality: 'Charlotte',
    addressRegion: 'NC',
    postalCode: '28205',
    addressCountry: 'US',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  ],
  // areaServed is emitted only once the licensed-state list is confirmed
  // in lib/licensedStates.ts. Never hardcode states here.
  ...(licensedStateNames().length > 0
    ? { areaServed: licensedStateNames().map((name) => ({ '@type': 'State', name })) }
    : {}),
  serviceType: [
    'Health Insurance',
    'Medicare Insurance',
    'Life Insurance',
    'Business Insurance',
    'General Liability Insurance',
    "Workers' Compensation Insurance",
    'Auto Insurance',
    'Homeowners Insurance',
    'Renters Insurance',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <ScrollRevealInit />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
