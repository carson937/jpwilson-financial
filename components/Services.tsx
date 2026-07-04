const services = [
  {
    num: '01',
    name: 'Medicare Insurance',
    desc: 'Navigate every plan in your area — Advantage, Supplement, and Part D — compared side by side so you enroll right the first time.',
    tags: ['Medicare Advantage', 'Supplement (Medigap)', 'Part D', 'DSNP'],
    badge: 'Most Requested',
    cta: 'Compare Medicare Plans',
  },
  {
    num: '02',
    name: 'Life Insurance',
    desc: "Term, whole, and universal life from top-rated carriers. Built around your family's financial future, not a one-size-fits-all policy.",
    tags: ['Term Life', 'Whole Life', 'Universal', 'Final Expense'],
    badge: null,
    cta: 'Get a Life Quote',
  },
  {
    num: '03',
    name: 'Business Insurance',
    desc: 'General liability, commercial property, and workers comp tailored to your industry. We make sure your business is never exposed.',
    tags: ['General Liability', 'Commercial Property', 'Workers Comp', 'BOP'],
    badge: null,
    cta: 'Protect Your Business',
  },
  {
    num: '04',
    name: 'Auto Insurance',
    desc: 'Multiple carrier comparison for personal and commercial vehicles. We find the lowest rate without cutting your coverage.',
    tags: ['Personal Auto', 'Commercial Vehicles', 'SR-22'],
    badge: null,
    cta: 'Get Auto Quote',
  },
  {
    num: '05',
    name: 'Home Insurance',
    desc: 'Homeowners, renters, and landlord policies across top carriers — bundled with auto when possible for maximum savings.',
    tags: ['Homeowners', 'Renters', 'Landlord', 'Umbrella'],
    badge: null,
    cta: 'Protect Your Home',
  },
]

export default function Services() {
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
            From Medicare to your business policy — we compare every option
            across 30+ carriers. You get the right coverage at the right price,
            without the runaround.
          </p>
        </div>

        {/* Services — editorial list, full-bleed rows */}
        <div>
          {services.map((s, i) => (
            <a
              key={s.num}
              href="#get-quote"
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
                <div className="service-arrow flex items-center gap-2 text-gold font-semibold text-sm whitespace-nowrap pt-2 self-start">
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
