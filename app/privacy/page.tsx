export const metadata = {
  title: 'Privacy Policy — JP Wilson Financial Group',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-4">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-navy-950 tracking-[-0.04em] leading-[1.05] mb-10">
          Privacy Policy
        </h1>

        <div className="prose prose-sm max-w-none text-navy-800/70 space-y-8 leading-relaxed">
          <p className="text-sm">Last updated: {new Date().getFullYear()}</p>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Information We Collect</h2>
            <p>
              When you request a quote or contact us, we collect your name, phone number,
              email address, and information about your insurance needs. This information is
              used solely to provide you with insurance quotes and follow-up from a licensed advisor.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">How We Use Your Information</h2>
            <p>
              We use your information to prepare insurance quotes, contact you with
              personalized options, and improve our services. We do not sell, rent, or
              share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Insurance Carriers</h2>
            <p>
              To obtain quotes on your behalf, we share the necessary information with
              insurance carriers you express interest in. This is required to generate
              accurate pricing and coverage options.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information. Our website
              uses industry-standard encryption (HTTPS) for all data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-navy-950 font-bold text-lg mb-3">Contact Us</h2>
            <p>
              If you have questions about this privacy policy or how your information is
              handled, contact us at{' '}
              <a
                href="mailto:contact@jpwilsonfinancial.com"
                className="text-gold hover:text-gold-dark transition-colors"
              >
                contact@jpwilsonfinancial.com
              </a>{' '}
              or call{' '}
              <a href="tel:+18667861585" className="text-gold hover:text-gold-dark transition-colors">
                (866) 786-1585
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
  )
}
