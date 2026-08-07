import type { Metadata } from 'next'
import QuoteEntry from './QuoteEntry'

/**
 * Life Insurance quote funnel entry point.
 *
 * One explicit route per product rather than a dynamic `[product]` router: it
 * keeps the release surface obvious, and it stops product eligibility rules
 * from quietly becoming routing logic. Auto gets its own page when its funnel
 * is approved.
 */

export const metadata: Metadata = {
  title: 'Get a Life Insurance Quote | JP Wilson Financial Group',
  description:
    'Answer a few quick questions and a licensed member of the JP Wilson Financial Group team will help you find the right life insurance coverage.',
  alternates: { canonical: '/life-insurance/quote' },
  // A funnel page has no business in search results competing with the site
  // itself, and an indexed step is a page with no context.
  robots: { index: false, follow: true },
}

/**
 * `qx-surface` lets globals.css paint the document background to match the
 * card surface — see the QUOTE FUNNEL SURFACE rule there. Without it the
 * scrollbar gutter and iOS overscroll show the dark site chrome.
 */
export default function LifeQuotePage() {
  return (
    <main
      id="main"
      className="qx-surface flex min-h-[100dvh] items-center justify-center bg-[#FAF8F4] px-4 py-8 sm:py-12"
      style={{
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
        paddingTop: 'calc(2rem + env(safe-area-inset-top))',
      }}
    >
      <QuoteEntry />
    </main>
  )
}
