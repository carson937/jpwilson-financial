import type { Metadata } from 'next'
import QuoteEntry from './QuoteEntry'

export const metadata: Metadata = {
  title: 'General Liability + Workers’ Comp | JP Wilson Financial Group',
  description: 'A short combined business insurance request for General Liability and Workers’ Compensation guidance.',
  robots: { index: false, follow: false },
}

export default function BusinessInsuranceQuotePage() {
  // The commercial shell/hero own their full-bleed navy-band + bone editorial
  // layout, so the page wrapper stays out of the way.
  return (
    <main id="main" className="qx-surface bg-bone">
      <QuoteEntry />
    </main>
  )
}

