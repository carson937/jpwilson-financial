import type { Metadata } from 'next'
import QuoteEntry from './QuoteEntry'

export const metadata: Metadata = {
  title: 'Auto Insurance Request | JP Wilson Financial Group',
  description: 'Request personal guidance on auto insurance from JP Wilson Financial Group.',
  alternates: { canonical: '/auto-insurance/quote' },
  robots: { index: false, follow: true },
  referrer: 'no-referrer',
}

export default function AutoQuotePage() {
  return <main id="main" className="qx-surface flex min-h-[100dvh] items-center justify-center bg-[#FAF8F4] px-4 py-8 sm:px-6 sm:py-12 lg:px-10"
    style={{ paddingBottom: 'calc(clamp(1rem, 4vh, 2rem) + env(safe-area-inset-bottom))', paddingTop: 'calc(clamp(1rem, 4vh, 2rem) + env(safe-area-inset-top))' }}>
    <QuoteEntry />
  </main>
}
