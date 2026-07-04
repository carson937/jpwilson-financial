const supporting = [
  {
    quote: 'As a small business owner, insurance always felt overwhelming. JP Wilson broke it down, compared carriers, and found us better coverage at a lower price.',
    name: 'David R.',
    location: 'Charlotte, NC',
    coverage: 'Business Insurance',
    initials: 'DR',
  },
  {
    quote: 'I called three other agencies first. JP Wilson were the only ones who took time to compare my auto and home together and find real savings.',
    name: 'Sandra M.',
    location: 'Columbia, SC',
    coverage: 'Auto + Home Bundle',
    initials: 'SM',
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-navy-900 pt-24 md:pt-36 pb-24 md:pb-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-14">

        {/* Label */}
        <div className="flex items-center gap-4 mb-16 md:mb-20" data-reveal>
          <span className="h-px w-8 bg-gold/40 flex-shrink-0" />
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold">
            Client Stories
          </p>
        </div>

        {/* Hero testimonial */}
        <div className="relative mb-20 md:mb-28" data-reveal data-delay="1">
          <div
            className="absolute -top-12 -left-6 font-serif text-[220px] font-bold leading-none text-white/[0.03] select-none pointer-events-none"
            aria-hidden="true"
          >
            &ldquo;
          </div>

          <div className="relative">
            <Stars />
            <blockquote className="font-serif mt-6 mb-10 text-3xl md:text-4xl lg:text-[2.8rem] font-bold text-white/80 leading-[1.3] tracking-[-0.02em] text-balance max-w-5xl italic">
              JP Wilson saved us thousands on our Medicare Supplement plan.
              They explained every option and{' '}
              <span className="font-normal text-white/55 not-italic">
                never pushed us toward anything.
              </span>{' '}
              I felt like they genuinely cared about the right outcome.
            </blockquote>

            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-navy-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0" aria-hidden="true">
                MT
              </div>
              <div>
                <p className="text-white/70 font-semibold text-sm">Margaret T.</p>
                <p className="text-white/55 text-xs">
                  Greenville, SC · Medicare Supplement
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 h-px bg-gradient-to-r from-gold/20 via-white/5 to-transparent" />
        </div>

        {/* Supporting testimonials */}
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/6 mb-20 md:mb-24" data-reveal data-delay="2">
          {supporting.map((t) => (
            <div key={t.name} className="py-8 md:py-0 md:px-12 first:md:pl-0 last:md:pr-0">
              <Stars />
              <blockquote className="font-serif mt-5 mb-6 text-white/65 leading-relaxed italic text-sm md:text-base">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-navy-800 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" aria-hidden="true">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white/60 font-semibold text-xs">{t.name}</p>
                  <p className="text-white/55 text-[11px]">
                    {t.location} · {t.coverage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post-testimonial CTA */}
        <div className="border-t border-white/6 pt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-white font-bold text-xl mb-1 italic">
              Ready to see what we can find for you?
            </p>
            <p className="text-white/80 text-sm">
              Free review. No obligation. Usually same-day.
            </p>
          </div>
          <a
            href="#get-quote"
            className="btn-gold-cta flex-shrink-0 inline-flex items-center gap-2 font-semibold text-sm px-7 py-3.5 tracking-wide"
          >
            Get Your Free Review
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
