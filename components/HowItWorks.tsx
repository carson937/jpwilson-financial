const steps = [
  {
    num: '01',
    title: 'Tell Us What You Need',
    body: 'Share your coverage goals, current plan, and budget through the short quote request. No paperwork, no spam.',
    note: 'We start with listening — not selling.',
    align: 'left',
  },
  {
    num: '02',
    title: 'Patrick Reviews Your Options',
    body: 'Patrick looks at the coverage details that matter, then explains suitable options in plain language.',
    note: 'You see the comparison, not just the recommendation.',
    align: 'right',
  },
  {
    num: '03',
    title: 'You Choose What Fits',
    body: 'Choose the option that works for your situation. If you decide to move forward, Patrick helps with the next steps.',
    note: 'You stay in control of the decision.',
    align: 'left',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bone py-24 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-14">

        {/* Header */}
        <div className="mb-20 md:mb-28" data-reveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/70">
              The Process
            </p>
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-navy-950 tracking-[-0.02em] leading-[0.95]">
            Simple From
            <br />
            Start to Finish.
          </h2>
        </div>

        {/* Steps — alternating, no chrome cards */}
        <div>
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`relative grid md:grid-cols-2 border-t border-navy-900/8 ${
                i === steps.length - 1 ? 'border-b border-navy-900/8' : ''
              }`}
              data-reveal
              data-delay={String(i + 1)}
            >
              {/* Decorative number — background watermark */}
              <div
                className={`absolute pointer-events-none select-none hidden md:flex items-center ${
                  step.align === 'right' ? 'right-4 justify-end' : 'left-4 justify-start'
                } top-1/2 -translate-y-1/2`}
              >
                <span className="font-serif text-[10rem] font-bold text-navy-900/[0.05] leading-none tracking-[-0.06em]">
                  {step.num}
                </span>
              </div>

              {/* Content block — alternates */}
              <div
                className={`relative z-10 py-14 ${
                  step.align === 'right'
                    ? 'md:col-start-2 md:pl-16'
                    : 'md:pr-16'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-[11px] text-navy-900/65 tracking-widest">{step.num}</span>
                  <span className="h-px w-8 bg-gold/30" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-navy-950 tracking-[-0.02em] leading-[1.1] mb-4">
                  {step.title}
                </h3>
                <p className="text-navy-900/70 leading-relaxed mb-5 max-w-sm text-sm md:text-base">
                  {step.body}
                </p>
                <p className="text-xs text-navy-900/65 italic font-serif">{step.note}</p>
              </div>

              {/* Empty column spacer — keeps alternating alignment */}
              <div className={step.align === 'right' ? 'md:col-start-1 md:row-start-1' : ''} />
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          data-reveal
        >
          <p className="text-navy-900/65 text-sm">
            Start with a short request. Patrick will follow up personally.
          </p>
          <a
            href="#get-quote" data-cta-id="get-quote" data-cta-location="how_it_works"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm px-7 py-3.5 transition-colors duration-300 tracking-wide"
          >
            Start With a Free Review
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
