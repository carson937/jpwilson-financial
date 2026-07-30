import { OFFICE, hasLicensedStates, licensedStateNames } from '@/lib/licensedStates'

/**
 * Licensed territory + the single physical office.
 *
 * Two deliberately separate statements: the states Patrick is licensed in, and
 * the one place with a front door. Never merge them — there is no office in
 * Georgia, South Carolina, or Tennessee.
 *
 * Renders nothing if the licensed-state list is ever emptied.
 * Source of truth: lib/licensedStates.ts
 */
export default function LicensedToServe() {
  if (!hasLicensedStates()) return null

  const states = licensedStateNames()

  return (
    <section id="licensed" className="bg-bone py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-14">

        <div className="grid lg:grid-cols-[1fr_380px] gap-16 lg:gap-24 items-start">

          {/* Licensed states */}
          <div data-reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/70">
                Licensed to Serve
              </p>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 tracking-[-0.02em] leading-[1.05] mb-8">
              Licensed in
              <br />
              <span className="text-navy-900/55 italic">{states.length} states.</span>
            </h2>

            <ul className="border-t border-navy-900/10">
              {states.map((name) => (
                <li
                  key={name}
                  className="flex items-baseline justify-between gap-6 py-5 border-b border-navy-900/10"
                >
                  <span className="font-serif text-2xl md:text-3xl font-bold text-navy-950 tracking-[-0.01em]">
                    {name}
                  </span>
                  <span className="h-px flex-1 bg-navy-900/10" aria-hidden="true" />
                  <span className="text-[11px] tracking-[0.18em] uppercase text-gold-dark font-semibold">
                    Licensed
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-navy-900/70 text-sm leading-relaxed mt-7 max-w-lg">
              Patrick is licensed to write coverage in each of these states. Most
              reviews are handled by phone and email, wherever you are.
            </p>
          </div>

          {/* The one physical office */}
          <div data-reveal data-delay="1" className="lg:pt-4">
            <div className="border-t-2 border-navy-950 pt-7">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/70 mb-5">
                In-Person Office
              </p>

              <a
                href={OFFICE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <address className="not-italic">
                  <span className="block font-serif text-2xl md:text-3xl font-bold text-navy-950 tracking-[-0.01em] leading-tight group-hover:text-gold transition-colors duration-300">
                    {OFFICE.street}
                  </span>
                  <span className="block text-navy-900/70 text-base mt-1.5">
                    {OFFICE.city}, {OFFICE.state} {OFFICE.zip}
                  </span>
                </address>
                <span className="inline-flex min-h-11 items-center gap-2 text-gold-dark font-semibold text-sm mt-4">
                  Get directions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>

              <div className="mt-7 pt-7 border-t border-navy-900/10 space-y-4 text-sm">
                <div>
                  <p className="text-navy-900/70 text-[10px] uppercase tracking-[0.15em] mb-1">Hours</p>
                  <p className="text-navy-900/75">{OFFICE.hours}</p>
                </div>
                <div>
                  <p className="text-navy-900/70 text-[10px] uppercase tracking-[0.15em] mb-1">Phone</p>
                  <a href="tel:+18667861585" className="text-navy-900/75 hover:text-gold transition-colors duration-200">
                    (866) 786-1585
                  </a>
                </div>
                <div>
                  <p className="text-navy-900/70 text-[10px] uppercase tracking-[0.15em] mb-1">Email</p>
                  <a
                    href="mailto:contact@jpwilsonfinancial.com"
                    className="text-navy-900/75 hover:text-gold transition-colors duration-200 break-words"
                  >
                    contact@jpwilsonfinancial.com
                  </a>
                </div>
              </div>

              <p className="text-navy-900/70 text-xs leading-relaxed mt-6">
                Charlotte is our only office. Clients in the other licensed states
                are served remotely.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
