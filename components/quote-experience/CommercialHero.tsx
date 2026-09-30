'use client'
import Image from 'next/image'
import { BrandMark } from '@/components/BrandLogo'
import type { QuoteIntro } from '@/lib/quote-experience/types'

/**
 * The intro screen deliberately wears CommercialShell's chrome rather than its
 * own: identical outer padding, identical max-width, an identical header row
 * (BrandMark at 38, mb-7), and a spacer standing in for the progress track that
 * appears on step 1.
 *
 * That is what makes the first tap feel like a step change instead of a page
 * change — the mark, the column edges, and the first line of content all stay
 * exactly where they were. It previously centred itself vertically at px-6 with
 * a 46px mark, so the logo jumped up and left, shrank, and the content slid up
 * the moment the funnel started.
 *
 * Content, copy, order, and CTA are untouched.
 */
export default function CommercialHero({ intro, onStart }: { intro: QuoteIntro; onStart: () => void }) {
  return (
    <div className="commercial-flow min-h-dvh bg-bone px-5 pb-5 pt-5 text-navy-950 sm:pt-10">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-7 flex items-center justify-between gap-5"><BrandMark size={38} /></div>
        {/* Reserves the progress track's height so the card below does not
            shift when the real track appears on step 1. */}
        <div aria-hidden="true" className="mb-7 h-[3px]" />
        <p className="mb-3 text-[12px] font-semibold text-navy-900/75">For business owners in NC, SC, GA &amp; TN</p>
        <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[42px]">{intro.headline}</h1>
        <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-navy-900/80">{intro.body}</p>
        <div className="mt-7 flex items-center gap-3">
          <Image src="/patrick-wilson-headshot.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover object-top" />
          <p className="text-[12px] leading-relaxed text-navy-900/80"><span className="block font-semibold text-navy-950">Patrick Wilson &amp; team</span>Personal guidance. No documents to start.</p>
        </div>
        <button type="button" onClick={onStart} className="mt-7 flex min-h-[60px] w-full items-center justify-between gap-3 rounded-2xl bg-navy-950 px-5 text-[16px] font-semibold text-white transition-colors hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-900">
          {intro.cta}<span aria-hidden="true" className="text-gold-light">→</span>
        </button>
        <p className="mt-3 text-center text-[12px] text-navy-900/75">7 quick steps · No obligation</p>
      </div>
    </div>
  )
}
