import type { Metadata } from 'next'
import QuoteEntry from './QuoteEntry'

export const metadata: Metadata = {
  title: 'General Liability + Workers’ Comp | JP Wilson Financial Group',
  description: 'A short combined business insurance request for General Liability and Workers’ Compensation guidance.',
  robots: { index: false, follow: false },
}

export default function BusinessInsuranceQuotePage() {
  return <main className="qx-surface flex min-h-dvh items-center justify-center bg-[#173D3A] px-4 py-8 sm:px-6"><QuoteEntry /></main>
}

