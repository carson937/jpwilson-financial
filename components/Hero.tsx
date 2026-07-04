import LeadCapture from './LeadCapture'
import CrestLogo from './CrestLogo'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-bone overflow-hidden" style={{ minHeight: '100svh' }}>

      {/* Atmosphere — very subtle navy depth at bottom-right, not a wall */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 108% 108%, rgba(12,24,41,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-8 md:px-14 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center gap-14 lg:gap-20 pt-28 pb-16 lg:py-0 lg:min-h-screen">

        {/* ── LEFT: Brand editorial ── */}
        <div className="flex-1">

          {/* Crest + gold bars — the brand anchor */}
          <div className="flex items-center mb-14 -mx-8 md:-mx-14 lg:-mx-16">
            <div className="crest-bar-line reverse" />
            <div className="mx-10 flex-shrink-0">
              <CrestLogo size={160} />
            </div>
            <div className="crest-bar-line" />
          </div>

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold">
              Independent Insurance Advisors · SC &amp; NC
            </p>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[3rem] md:text-[4.2rem] lg:text-[4.8rem] font-bold text-navy-950 tracking-[-0.02em] leading-[1.05] mb-7">
            Find Better
            <br />Insurance.
            <br /><span className="text-gold italic">Pay Less.</span>
          </h1>

          <p className="text-[15px] text-navy-900/50 leading-relaxed max-w-md mb-10">
            We compare 30+ top carriers across Medicare, life, business,
            and personal insurance — at no cost to you.
          </p>

          {/* Phone */}
          <a
            href="tel:+18667861585"
            className="inline-flex items-center gap-2 text-navy-900/35 hover:text-navy-900/70 text-sm transition-colors duration-300 mb-14 group"
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
                <span className="text-gold text-[11px] leading-none">★★★★★</span>
                5.0 Google Reviews
              </span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">Licensed in SC &amp; NC</span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">No-Obligation Quotes</span>
              <span className="text-navy-900/20 text-xs hidden sm:inline">·</span>
              <span className="text-navy-900/40 text-xs">30+ Carriers Compared</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Consultation card — premium dark card on bone ── */}
        <div className="w-full lg:w-[420px] flex-shrink-0 pb-4 lg:pb-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/25 mb-3 hidden lg:block">
            Start your free coverage review
          </p>
          {/* Card sits on bone as a contained premium element — not a half-screen slab */}
          <div className="shadow-[0_12px_56px_rgba(7,15,28,0.12)]">
            <LeadCapture />
          </div>
          <p className="text-navy-900/20 text-[10px] text-center mt-3 hidden lg:block">
            Takes 90 seconds · No spam · No obligation
          </p>
        </div>

      </div>
    </section>
  )
}
