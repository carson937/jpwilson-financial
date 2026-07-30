 'use client'

import LeadCapture from './LeadCapture'
import { LICENSED_STATES } from '@/lib/licensedStates'
import { BrandCrest } from './BrandLogo'
import { trackEvent } from '@/lib/analytics'

export default function Hero() {
  return (
    // `svh` (small viewport height) instead of `vh`: iOS Safari sizes `100vh`
    // to the *expanded* viewport, so a `100vh` hero is taller than the screen
    // while the address bar is showing and the quiz gets pushed out of reach.
    <section className="relative bg-bone overflow-hidden lg:min-h-[100svh]">

      {/* Atmosphere — very subtle navy depth at bottom-right, not a wall */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 108% 108%, rgba(12,24,41,0.07) 0%, transparent 65%)',
        }}
      />

      {/*
        The header is fixed and 72px tall. `lg:py-0` used to centre this row in
        the full viewport, which pushed the crest up underneath the nav on
        shorter laptop screens. Keeping real top padding at every breakpoint
        means the content is centred inside the space the header leaves.
      */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-14 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center gap-8 md:gap-14 lg:gap-20 pt-24 md:pt-28 pb-12 md:pb-16 lg:pt-28 lg:pb-16 lg:min-h-[100svh]">

        {/* ── LEFT: Brand editorial ── */}
        <div className="flex-1 min-w-0">

          {/* Official crest + gold bars — the brand anchor */}
          <div className="flex items-center mb-8 md:mb-14 -mx-6 md:-mx-14 lg:-mx-16">
            <div className="crest-bar-line reverse" />
            <div className="mx-6 md:mx-10 flex-shrink-0">
              <div className="md:hidden">
                <BrandCrest size={88} />
              </div>
              <div className="hidden md:block">
                <BrandCrest size={148} />
              </div>
            </div>
            <div className="crest-bar-line" />
          </div>

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold">
              Licensed in {LICENSED_STATES.join(' · ')}
            </p>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[3rem] md:text-[4.2rem] lg:text-[4.8rem] font-bold text-navy-950 tracking-[-0.02em] leading-[1.05] mb-7">
            Find Better
            <br />Insurance.
            <br /><span className="text-gold italic">Pay Less.</span>
          </h1>

          <p className="text-[15px] text-navy-900/70 leading-relaxed max-w-md mb-10">
            Patrick Wilson helps individuals, families, and businesses compare
            suitable health and Medicare coverage, along with life, business,
            and personal insurance options, without unnecessary pressure.
          </p>

          {/* Phone */}
          <a
            href="tel:+18667861585"
            onClick={() => trackEvent('phone_cta_clicked', { location: 'hero' })}
            className="inline-flex min-h-11 items-center gap-2 text-navy-900/65 hover:text-navy-900/90 text-sm transition-colors duration-300 mb-8 md:mb-14 group"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-gold/60 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Prefer to call? (866) 786-1585
          </a>

          {/* Trust signals */}
          <div className="pt-7 border-t border-navy-900/10">
            <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
              <span className="flex items-center gap-1.5 text-navy-900/40 text-xs">
                <svg className="w-3.5 h-3.5 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.5-4.5A11.95 11.95 0 0112 3a11.95 11.95 0 01-8.5 2.5A12 12 0 003 9.75c0 5.02 3.08 9.32 7.45 11.1a4 4 0 003.1 0C17.92 19.07 21 14.77 21 9.75c0-1.48-.17-2.9-.5-4.25z" />
                </svg>
                Independent advisor
              </span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">Charlotte office</span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">No-Obligation Quotes</span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">Personal Guidance</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Consultation card — premium dark card on bone ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0 pb-4 lg:pb-0">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-navy-900/65 mb-3 hidden lg:block">
            Start your free coverage review
          </p>
          {/* Card sits on bone as a contained premium element — not a half-screen slab */}
          <div className="shadow-[0_12px_56px_rgba(7,15,28,0.12)]">
            <LeadCapture />
          </div>
          <p className="text-navy-900/55 text-xs text-center mt-3 hidden lg:block">
            Takes 90 seconds · No spam · No obligation
          </p>
        </div>

      </div>
    </section>
  )
}
