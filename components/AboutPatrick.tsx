import Image from 'next/image'

export default function AboutPatrick() {
  return (
    <section id="about" className="bg-navy-900 py-24 md:py-36 noise-overlay overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-8 md:px-14">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-20 items-center">
          <div className="relative" data-reveal>
            <div className="absolute -inset-5 border border-gold/15 hidden md:block" aria-hidden="true" />
            <div className="relative overflow-hidden bg-navy-950 border border-white/8">
              <Image
                src="/patrick-wilson-headshot.png"
                alt="Patrick Wilson"
                width={1024}
                height={1536}
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="aspect-[4/5] w-full object-cover object-[50%_18%]"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/65 to-transparent"
                aria-hidden="true"
              />
            </div>
          </div>

          <div data-reveal data-delay="1">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-6 bg-gold/60 flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold">
                About Patrick
              </p>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.02em] leading-[1.05] mb-7">
              Insurance Guidance
              <br />
              From a Real Advisor.
            </h2>

            <div className="space-y-5 text-white/65 text-sm md:text-base leading-relaxed max-w-xl">
              <p>
                Patrick Wilson works with individuals, families, and businesses,
                meeting clients at the Charlotte office or remotely.
              </p>
              <p>
                His approach is simple: listen first, understand what each client
                needs, then help compare suitable insurance options without
                unnecessary pressure.
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-white/8 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="font-serif text-white font-bold text-xl italic mb-2">
                  Independent
                </p>
                <p className="text-white/55 text-sm leading-relaxed">
                  Patrick is not tied to one carrier, so the conversation stays
                  focused on fit, coverage, and cost.
                </p>
              </div>
              <div>
                <p className="font-serif text-white font-bold text-xl italic mb-2">
                  Local
                </p>
                <p className="text-white/55 text-sm leading-relaxed">
                  In-person guidance from the Charlotte office at 1200 The Plaza,
                  covering health, Medicare, life, business, and personal insurance.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#get-quote"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm px-7 py-3.5 transition-colors duration-300 tracking-wide"
              >
                Request a Free Review
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="tel:+18667861585"
                className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-gold/50 text-white/70 hover:text-white font-semibold text-sm px-7 py-3.5 transition-colors duration-300"
              >
                Call Patrick
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
