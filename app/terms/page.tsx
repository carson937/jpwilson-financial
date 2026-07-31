import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service | JP Wilson Financial Group',
  // Without this the root layout's `alternates.canonical: '/'` is
  // inherited, telling search engines this page is a duplicate of the
  // homepage.
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="min-h-[100svh] bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-4">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-navy-950 tracking-[-0.04em] leading-[1.05] mb-10">
          Terms of Service
        </h1>

        <div className="prose prose-sm max-w-none text-navy-800/70 space-y-8 leading-relaxed">
          <p className="text-sm">Last updated: July 21, 2026</p>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Use of This Website</h2>
            <p>
              This website is operated by JP Wilson Financial Group. By using
              this site, you agree to these terms. The information on
              this site is for general informational purposes and does not constitute
              insurance advice.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">No Obligation</h2>
            <p>
              Requesting a quote or submitting your contact information through this
              website does not create any obligation to purchase insurance. All quotes
              are provided free of charge and without commitment.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Accuracy of Information</h2>
            <p>
              We strive to provide accurate and up-to-date information, but insurance
              products, rates, and availability change frequently. All coverage details
              and pricing must be confirmed before enrollment.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Service Area</h2>
            <p>
              JP Wilson Financial Group operates from 1200 The Plaza, Charlotte, NC 28205.
              Patrick operates as an independent insurance advisor and is not
              exclusively affiliated with any single carrier.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:contact@jpwilsonfinancial.com"
                className="text-gold hover:text-gold-dark transition-colors"
              >
                contact@jpwilsonfinancial.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-navy-800/40 hover:text-navy-950 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
      </main>
      <Footer />
    </>
  )
}
