'use client'

import type { QuoteIntro } from '@/lib/quote-experience/types'
import TrustRow from './TrustRow'
import { ArrowRightIcon } from './icons'

/**
 * The intro screen. One headline, one paragraph, three assurances, one CTA.
 *
 * No fields here on purpose: asking for something before saying what the thing
 * is trades the visitor's trust for one field, and the first question is
 * cheaper to answer once they have already chosen to start.
 *
 * This screen carries no progress bar and no step counter — it is not a
 * question, and numbering it would misstate the length of the funnel.
 */
export default function LandingHero({
  intro,
  onStart,
}: {
  intro: QuoteIntro
  onStart: () => void
}) {
  return (
    <div>
      <h1 className="font-serif text-[34px] font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-[38px]">
        {intro.headline}
      </h1>
      <p className="mt-3.5 text-[15.5px] leading-relaxed text-navy-900/60">{intro.body}</p>

      <div className="mt-6">
        <TrustRow items={intro.assurances} />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-xl bg-navy-900 px-7 text-[15.5px] font-semibold text-white transition-all duration-200 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-900/25 active:scale-[0.99]"
      >
        {intro.cta}
        <ArrowRightIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
