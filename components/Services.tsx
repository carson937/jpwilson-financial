'use client'

import { trackEvent } from '@/lib/analytics'

/**
 * Health Insurance and Medicare Insurance carry equal hierarchy by client
 * direction (CLIENT_CONTEXT.md, 2026-07-29). They render as one paired row so
 * neither sits above the other. Do not add a badge, reorder, or split them into
 * separate rows without a written client decision.
 */
const primaryPair = [
  {
    name: 'Health Insurance',
    desc: 'Individual and group health plans reviewed around your household or team, comparing networks, deductibles, and total yearly cost.',
    tags: ['Individual Plans', 'Group Plans', 'Family Coverage'],
    cta: 'Compare Health Plans',
  },
  {
    name: 'Medicare Insurance',
    desc: 'Medicare Advantage, Supplement, and Part D options compared against your doctors, prescriptions, and budget.',
    tags: ['Medicare Advantage', 'Supplement (Medigap)', 'Part D', 'DSNP'],
    cta: 'Compare Medicare Plans',
  },
]

const services = [
  {
    num: '02',
    name: 'Life Insurance',
    desc: "Term, whole, final expense, and other life insurance options considered around your family's financial needs, not a one-size-fits-all policy.",
    tags: ['Term Life', 'Whole Life', 'Universal', 'Final Expense'],
    badge: null,
    cta: 'Get a Life Quote',
  },
  {
    num: '03',
    name: 'Business & Commercial Insurance',
    desc: 'General Liability, Workers’ Compensation, commercial property, and related policies reviewed around your business, industry, and risk exposure.',
    tags: ['General Liability', 'Workers’ Compensation', 'Commercial Property', 'BOP'],
    badge: null,
    cta: 'Protect Your Business',
  },
  {
    num: '04',
    name: 'Auto Insurance',
    desc: 'Personal and commercial auto options compared with attention to liability limits, deductibles, drivers, vehicles, and total cost.',
    tags: ['Personal Auto', 'Commercial Vehicles', 'SR-22'],
    badge: null,
    cta: 'Get Auto Quote',
  },
  {
    num: '05',
    name: 'Homeowners & Renters Insurance',
    desc: 'Homeowners, renters, and landlord policies reviewed with bundling options when they make sense for your household.',
    tags: ['Homeowners', 'Renters', 'Landlord', 'Umbrella'],
    badge: null,
    cta: 'Protect Your Home',
  },
]

export default function Services() {
  function selectService(name: string) {
    window.dispatchEvent(new CustomEvent('patrick:coverage-selected', { detail: { coverage: name } }))
    trackEvent('service_cta_clicked', { coverage: name })
    trackEvent('coverage_selected', { form: 'service_row', coverage: name })
  }

  return (
    <section id="services" className="bg-white pt-24 md:pt-32 pb-0">
      <div className="max-w-7xl mx-auto px-8 md:px-14">

        {/* Section header */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-end pb-16 border-b border-navy-900/8" data-reveal>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/70">
                What We Cover
              </p>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-navy-950 tracking-[-0.02em] leading-[0.95]">
              Complete
              <br />
              Coverage.
              <br />
              <span className="text-navy-900/55 italic">One Source.</span>
            </h2>
          </div>
          <p className="text-navy-900/70 text-sm leading-relaxed pb-1">
            From health and Medicare coverage to your business policy, Patrick
            helps you compare suitable options clearly so you can choose coverage
            with confidence, without the runaround.
          </p>
        </div>

        {/* Services — editorial list, full-bleed rows */}
        <div>

          {/* Row 01 — Health & Medicare share one row at equal weight */}
          <div
            className="block -mx-8 md:-mx-14 px-8 md:px-14 py-10 md:py-12 border-b border-navy-900/8"
            data-reveal
          >
            <div className="grid md:grid-cols-[64px_1fr] gap-6 md:gap-10 items-start">
              <span className="text-xs font-mono text-navy-900/70 pt-2 hidden md:block tracking-wider" aria-hidden="true">
                01
              </span>

              <div className="grid md:grid-cols-2 gap-10 md:gap-12">
                {primaryPair.map((s) => (
                  <a
                    key={s.name}
                    href="#get-quote"
                    onClick={() => selectService(s.name)}
                    className="service-row group block"
                  >
                    <h3 className="service-name font-serif text-3xl md:text-4xl font-bold text-navy-950 tracking-[-0.02em] leading-none transition-colors duration-300 mb-3">
                      {s.name}
                    </h3>
                    <p className="text-navy-900/70 text-sm leading-relaxed mb-5">
                      {s.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {s.tags.map((tag) => (
                        <span key={tag} className="text-[11px] font-medium text-navy-900/80 tracking-wide">
                          {tag}
                          {tag !== s.tags[s.tags.length - 1] && (
                            <span className="ml-2 text-navy-900/30" aria-hidden="true">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="service-arrow flex min-h-11 items-center gap-2 text-gold-dark font-semibold text-sm whitespace-nowrap">
                      {s.cta}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {services.map((s, i) => (
            <a
              key={s.num}
              href="#get-quote"
              onClick={() => selectService(s.name)}
              className="service-row block -mx-8 md:-mx-14 px-8 md:px-14 py-10 md:py-12 border-b border-navy-900/8 group"
              data-reveal
              data-delay={String(i + 1)}
            >
              <div className="grid md:grid-cols-[64px_1fr_auto] gap-6 md:gap-10 items-start">

                {/* Number */}
                <span className="text-xs font-mono text-navy-900/70 pt-2 hidden md:block tracking-wider" aria-hidden="true">
                  {s.num}
                </span>

                {/* Content */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-4 mb-3">
                    <h3 className="service-name font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-navy-950 tracking-[-0.02em] leading-none transition-colors duration-300">
                      {s.name}
                    </h3>
                    {s.badge && (
                      <span className="text-[9px] font-bold tracking-widest uppercase text-navy-900/65 border border-navy-900/20 px-2.5 py-1 self-center">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-navy-900/70 text-sm leading-relaxed max-w-xl mb-5">
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium text-navy-900/80 tracking-wide">
                        {tag}
                        {tag !== s.tags[s.tags.length - 1] && (
                          <span className="ml-2 text-navy-900/30" aria-hidden="true">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="service-arrow flex min-h-11 items-center gap-2 text-gold-dark font-semibold text-sm whitespace-nowrap pt-2 self-start">
                  {s.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
