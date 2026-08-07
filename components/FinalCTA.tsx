'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'
import { selectableStates } from '@/lib/licensedStates'
import { isValidState, isValidUSPhone, isValidZip, splitFullName } from '@/lib/leadValidation'

const coverageOptions = [
  'Health Insurance',
  'Medicare (Advantage / Supplement / Part D)',
  'Life Insurance',
  'Business Insurance',
  'Auto Insurance',
  'Home / Renters Insurance',
  'Multiple, not sure yet',
]

const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL

export default function FinalCTA() {
  const [name, setName]               = useState('')
  const [phone, setPhone]             = useState('')
  const [state, setUsState]           = useState('')
  const [zip, setZip]                 = useState('')
  const [coverage, setCoverage]       = useState('')
  const [message, setMessage]         = useState('')
  const [website, setWebsite]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    const applyCoverage = (event: Event) => {
      const selected = (event as CustomEvent<{ coverage: string }>).detail?.coverage
      if (selected) setCoverage(selected)
    }

    window.addEventListener('patrick:coverage-selected', applyCoverage)
    return () => window.removeEventListener('patrick:coverage-selected', applyCoverage)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    if (!isValidUSPhone(phone)) {
      setError('Please enter a valid phone number.')
      return
    }
    if (!isValidState(state)) {
      setError('Please select your state.')
      return
    }
    if (!isValidZip(zip)) {
      setError('Please enter a valid 5-digit ZIP code.')
      return
    }
    setSubmitting(true)
    setError('')

    const { firstName, lastName } = splitFullName(name)
    trackEvent('form_submission_attempted', { form: 'bottom_form', coverage: coverage || 'Not specified' })

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone.trim(),
          email: '',
          state,
          zip,
          coverageLabel: coverage || 'Not specified',
          situation: '',
          urgency: '',
          notes: message.trim(),
          source: 'Free Quote Form',
          website,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again or call us directly.')
        trackEvent('form_submission_failed', { form: 'bottom_form', status: res.status })
        setSubmitting(false)
        return
      }
    } catch {
      setError('Network error. Please try again or call (866) 786-1585.')
      trackEvent('form_submission_failed', { form: 'bottom_form', status: 'network' })
      setSubmitting(false)
      return
    }

    trackEvent('form_submission_succeeded', { form: 'bottom_form', coverage: coverage || 'Not specified' })
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <section
      id="get-quote"
      className="relative bg-navy-950 noise-overlay py-24 md:py-36 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(42,66,112,0.5) 0%, transparent 80%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-8 md:px-14">
        <div className="grid lg:grid-cols-[1fr_480px] gap-16 lg:gap-24 items-start">

          {/* Left */}
          <div className="lg:pt-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-6 bg-gold/60 flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold/60">
                Get Started
              </p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Ready to Find
              <br />
              Better Coverage?
            </h2>
            <p className="text-white/45 text-base leading-relaxed max-w-md mb-10">
              Share what you need and Patrick will follow up with a clear,
              pressure-free review of suitable insurance options.
            </p>

            <div className="space-y-4">
              {[
                ['Independent advisor', 'Patrick is not tied to one carrier.'],
                ['Short request form', 'Only key contact and coverage details.'],
                ['In-person or remote', 'Charlotte office, or handled by phone and email.'],
              ].map(([title, body]) => (
                <div key={title} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-white/70 text-sm font-semibold">{title}</p>
                    <p className="text-white/55 text-xs">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-white/8">
              <p className="text-white/55 text-xs mb-1">Prefer to call directly?</p>
              <a
                href="tel:+18667861585"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (866) 786-1585
              </a>
            </div>
          </div>

          {/* Right — contact form */}
          <div className="bg-navy-900 border border-white/8">
            {submitted ? (
              <div className="p-8 text-center py-14">
                <div className="w-12 h-12 border border-gold/25 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-serif text-white font-bold text-lg mb-2 italic">Request Received.</h2>
                <p className="text-white/65 text-sm leading-relaxed mb-6">
                  JP Wilson Financial Group has received your request. Patrick will
                  review your coverage details and contact you directly to talk through your options.
                </p>
                <div className="flex flex-col gap-3 items-center">
                  {bookingUrl && (
                    <a
                      href={bookingUrl}
                      onClick={() => trackEvent('booking_cta_clicked', { location: 'bottom_thank_you' })}
                      className="inline-flex min-h-11 items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm px-5 py-3 transition-colors"
                    >
                      Pick a Time
                    </a>
                  )}
                  <a
                    href="tel:+18667861585"
                    onClick={() => trackEvent('phone_cta_clicked', { location: 'bottom_thank_you' })}
                    className="inline-flex min-h-11 items-center gap-2 text-gold font-semibold text-sm hover:text-gold-dark transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call now if urgent: (866) 786-1585
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-7 md:p-8">
                <h2 className="font-serif text-white font-bold text-lg mb-1 italic">
                  Request Your Free Review
                </h2>
                <p className="text-white/55 text-[11px] mb-6 tracking-wide">
                  No obligation. Patrick will follow up personally.
                </p>
                <p className="text-white/75 text-xs leading-relaxed mb-5">
                  Your information stays with JP Wilson Financial Group. It is not sold or distributed to multiple agents.
                </p>

                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="bottom-website">Website</label>
                  <input
                    id="bottom-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-3 mb-5">
                  <label htmlFor="bottom-name" className="sr-only">Full name</label>
                  <input
                    id="bottom-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                    className="w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm text-white placeholder-white/55 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
                  />
                  <label htmlFor="bottom-phone" className="sr-only">Phone number</label>
                  <input
                    id="bottom-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Phone number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={10}
                    maxLength={20}
                    pattern="^[0-9+\(\)\.\-\s]{10,20}$"
                    className="w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm text-white placeholder-white/55 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="bottom-state" className="sr-only">State</label>
                      <select
                        id="bottom-state"
                        name="state"
                        autoComplete="address-level1"
                        value={state}
                        onChange={(e) => setUsState(e.target.value)}
                        required
                        aria-label="State"
                        className="select-chevron w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm focus:outline-none focus:border-gold/50 transition-colors rounded-none"
                        style={{ color: state ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.55)' }}
                      >
                        <option value="" disabled>State *</option>
                        {selectableStates().map(({ code, name }) => (
                          <option key={code} value={code} style={{ color: '#F4F1EA', backgroundColor: '#0C1829' }}>
                            {name} ({code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="bottom-zip" className="sr-only">ZIP code</label>
                      <input
                        id="bottom-zip"
                        name="zip"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="ZIP code *"
                        value={zip}
                        onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        required
                        pattern="^\d{5}$"
                        maxLength={5}
                        className="w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm text-white placeholder-white/55 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
                      />
                    </div>
                  </div>
                  <label htmlFor="bottom-coverage" className="sr-only">Coverage type</label>
                  <select
                    id="bottom-coverage"
                    name="coverage"
                    value={coverage}
                    onChange={(e) => {
                      setCoverage(e.target.value)
                      trackEvent('coverage_selected', { form: 'bottom_form', coverage: e.target.value })
                    }}
                    aria-label="Coverage type"
                    className="select-chevron w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm focus:outline-none focus:border-gold/50 transition-colors rounded-none"
                    style={{ color: coverage ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.55)' }}
                  >
                    <option value="" disabled>Coverage type (optional)</option>
                    {coverageOptions.map((o) => (
                      <option key={o} value={o} style={{ color: '#F4F1EA', backgroundColor: '#0C1829' }}>{o}</option>
                    ))}
                  </select>
                  <label htmlFor="bottom-message" className="sr-only">Additional notes</label>
                  <textarea
                    id="bottom-message"
                    name="message"
                    placeholder="Anything else we should know? (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm text-white placeholder-white/55 focus:outline-none focus:border-gold/50 transition-colors resize-none rounded-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-red-950/40 border border-red-500/20">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm py-4 transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2 tracking-wide"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send My Request
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-white/55 text-[10px] mt-3">
                  No spam. No obligation. We never sell your information.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
