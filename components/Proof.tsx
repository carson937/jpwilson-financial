const stats = [
  { num: '30+', label: 'Carriers Compared' },
  { num: '500+', label: 'Clients Protected' },
  { num: '$340', label: 'Avg Monthly Savings' },
]

const results = [
  {
    quote: 'Helped a client save $340 per month on her Medicare Supplement plan without reducing coverage.',
    tag: 'Medicare',
  },
  {
    quote: 'Found a small business owner 24% better liability coverage at the same monthly premium.',
    tag: 'Business Insurance',
  },
  {
    quote: "Reduced a family's combined auto and home cost by over $1,800 annually.",
    tag: 'Auto + Home',
  },
]

export default function Proof() {
  return (
    <section className="relative bg-navy-900 py-24 md:py-36 noise-overlay overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-8 md:px-14">

        {/* Stats — enormous typographic treatment */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 pb-20 border-b border-white/6" data-reveal>
          {stats.map(({ num, label }, i) => (
            <div key={label} data-reveal data-delay={String(i + 1)}>
              <p className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-[-0.03em] leading-none mb-3 italic">
                {num}
              </p>
              <p className="text-white/55 text-[10px] uppercase tracking-[0.2em] font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="pt-16" data-reveal>
          <div className="flex items-center gap-3 mb-14">
            <span className="h-px w-6 bg-gold/40 flex-shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold">
              Real Client Results
            </p>
          </div>

          {/* Featured result */}
          <div className="mb-16 pb-16 border-b border-white/6" data-reveal data-delay="1">
            <svg className="w-7 h-7 text-gold/15 mb-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white/80 leading-[1.45] italic mb-8 max-w-3xl">
              &ldquo;{results[0].quote}&rdquo;
            </p>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold border-b border-gold/25 pb-0.5">
              {results[0].tag}
            </span>
          </div>

          {/* Supporting results */}
          <div className="grid md:grid-cols-2 gap-12" data-reveal data-delay="2">
            {results.slice(1).map(({ quote, tag }) => (
              <div key={tag}>
                <p className="font-serif text-white/60 leading-relaxed italic mb-6 text-base md:text-lg">
                  &ldquo;{quote}&rdquo;
                </p>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-proof CTA */}
        <div className="mt-16 pt-16 border-t border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" data-reveal>
          <div>
            <p className="font-serif text-white font-bold text-xl mb-1 italic">
              See if you&rsquo;re overpaying.
            </p>
            <p className="text-white/55 text-sm">
              Free coverage review. Results vary — but most clients find savings.
            </p>
          </div>
          <a
            href="#get-quote"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm px-7 py-3.5 transition-colors duration-300 tracking-wide"
          >
            Get My Free Review
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
