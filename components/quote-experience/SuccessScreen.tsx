'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { QuoteSuccess } from '@/lib/quote-experience/types'
import { CheckIcon, ClockIcon, MailIcon, ShieldIcon, UserIcon } from './icons'

/**
 * The Thank You screen.
 *
 * Shown ONLY after /api/submit-lead confirms Jotform (or the configured
 * fallback) accepted the lead. A failed or timed-out request never reaches
 * here — telling someone their request was received when it was not is the
 * single worst failure this funnel could have.
 *
 * Every "what happens next" line is a commitment JP can keep. Do not add a
 * response-time promise that operations has not agreed to.
 */

const NEXT_STEP_GLYPHS = [UserIcon, ShieldIcon, ClockIcon]

export default function SuccessScreen({ success }: { success: QuoteSuccess }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  /**
   * Move focus to the heading on arrival. Without this a screen-reader user
   * hears nothing change: the button they pressed is gone and focus has fallen
   * back to the document body.
   */
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="text-center">
      <span className="mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gold">
        <CheckIcon className="h-7 w-7 text-white" />
      </span>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-serif text-[32px] font-bold leading-tight tracking-tight text-navy-900 outline-none"
      >
        {success.heading}
      </h1>
      <p className="mt-2 text-[15.5px] text-navy-900/60">{success.subheading}</p>

      <div className="mt-7 rounded-xl bg-[#FBF8F1] px-5 py-5 text-left">
        <p className="mb-4 flex items-center gap-3 text-[14.5px] font-semibold text-navy-900">
          <MailIcon className="h-[18px] w-[18px] shrink-0 text-gold" />
          {success.nextStepsTitle}
        </p>
        <ul className="space-y-3.5">
          {success.nextSteps.map((item, index) => {
            const Glyph = NEXT_STEP_GLYPHS[index % NEXT_STEP_GLYPHS.length]
            return (
              <li key={item} className="flex items-start gap-3">
                <Glyph className="mt-[1px] h-[18px] w-[18px] shrink-0 text-gold" />
                <span className="text-[14.5px] leading-snug text-navy-900/75">{item}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <Link
        href={success.ctaHref}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-navy-900 px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-900/25"
      >
        {success.ctaLabel}
      </Link>
    </div>
  )
}
