'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { selectableStates } from '@/lib/licensedStates'
import { isValidState, isValidUSPhone, isValidZip, splitFullName } from '@/lib/leadValidation'

const coverages = [
  { id: 'health',    label: 'Health Insurance',    sub: 'Individual · Group · Family' },
  { id: 'medicare',  label: 'Medicare',            sub: 'Advantage · Supplement · Part D' },
  { id: 'life',      label: 'Life Insurance',      sub: 'Term · Whole · Final Expense' },
  { id: 'auto',      label: 'Auto Insurance',      sub: 'Personal & Commercial' },
  { id: 'home',      label: 'Home Insurance',      sub: 'Homeowners · Renters · Landlord' },
  { id: 'business',  label: 'Business Insurance',  sub: 'Liability · Property · Workers Comp' },
]

const followUp: Record<string, { q: string; opts: string[] }> = {
  health: {
    q: 'What best describes your situation?',
    opts: ['Individual or family plan', 'Small group / employees', 'Losing current coverage', 'Comparing plan costs', 'Just exploring options'],
  },
  medicare: {
    q: 'What best describes your situation?',
    opts: ['Turning 65 soon', 'Already on Medicare', 'Losing employer coverage', 'Reviewing my options', 'Helping a family member'],
  },
  life: {
    q: 'What is your primary goal?',
    opts: ['Protect my family', 'Replace lost income', 'Cover final expenses', 'Build long-term wealth', 'Not sure yet'],
  },
  auto: {
    q: 'What best describes your situation?',
    opts: ['Looking for a lower rate', 'Buying a vehicle', 'Switching insurance companies', 'Need commercial coverage', 'Just exploring options'],
  },
  home: {
    q: 'What do you need coverage for?',
    opts: ['Homeowner policy', 'Rental property', 'Condo', 'Renters insurance', 'Comparing rates'],
  },
  business: {
    q: 'What type of business do you own?',
    opts: ['Contractor', 'Trucking', 'Retail', 'Professional Services', 'Other'],
  },
}

const urgencyOptions = [
  { label: 'ASAP',             sub: 'I need coverage now' },
  { label: 'Within 30 Days',   sub: 'Planning ahead' },
  { label: 'Within 90 Days',   sub: 'No rush' },
  { label: 'Just Researching', sub: 'Comparing options' },
]

type Step = 1 | 2 | 3 | 4 | 5
const totalSteps = 4
const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL

export default function LeadCapture() {
  const [step, setStep]             = useState<Step>(1)
  const [coverage, setCoverage]     = useState('')
  const [situation, setSituation]   = useState('')
  const [urgency, setUrgency]       = useState('')
  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [state, setUsState]         = useState('')
  const [zip, setZip]               = useState('')
  const [email, setEmail]           = useState('')
  const [notes, setNotes]           = useState('')
  const [website, setWebsite]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const progress      = step >= 4 ? 100 : Math.round((step / totalSteps) * 100)
  const coverageLabel = coverages.find(c => c.id === coverage)?.label ?? coverage

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
    trackEvent('form_submission_attempted', { form: 'hero_quiz', coverage: coverageLabel })

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone.trim(),
          email: email.trim(),
          state,
          zip,
          coverageLabel,
          situation,
          urgency,
          notes: notes.trim(),
          source: 'Hero Quiz Funnel',
          website,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again or call us directly.')
        trackEvent('form_submission_failed', { form: 'hero_quiz', status: res.status })
        setSubmitting(false)
        return
      }
    } catch {
      setError('Network error. Please try again or call (866) 786-1585.')
      trackEvent('form_submission_failed', { form: 'hero_quiz', status: 'network' })
      setSubmitting(false)
      return
    }

    trackEvent('form_submission_succeeded', { form: 'hero_quiz', coverage: coverageLabel, state })
    setStep(5)
    setSubmitting(false)
  }

  return (
    <div className="bg-navy-900 border border-white/8 w-full">
      {step < 5 && (
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="p-7 md:p-8">

        {step === 1 && (
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-1">Step 1 of {totalSteps}</p>
            <p className="font-serif text-white font-bold text-lg mb-5 italic">What coverage are you looking for?</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {coverages.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCoverage(c.id)
                    trackEvent('quiz_started', { form: 'hero_quiz' })
                    trackEvent('coverage_selected', { form: 'hero_quiz', coverage: c.label })
                    trackEvent('quiz_step_completed', { form: 'hero_quiz', step: 1 })
                    setStep(2)
                  }}
                  className="flex min-h-11 items-center justify-between px-4 py-3 border border-white/12 text-left transition-all duration-200 group hover:border-gold/40 hover:bg-white/3"
                >
                  <div>
                    <p className="text-white/90 font-semibold text-sm">{c.label}</p>
                    <p className="text-white/65 text-xs">{c.sub}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/35 group-hover:text-gold transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-white/70 text-xs">Free. No obligation. No address fields.</p>
          </div>
        )}

        {step === 2 && coverage && (
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-1">Step 2 of {totalSteps}</p>
            <p className="font-serif text-white font-bold text-lg mb-1 italic">{followUp[coverage].q}</p>
            <p className="text-white/70 text-xs mb-5">Helps Patrick prepare relevant options for you.</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {followUp[coverage].opts.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSituation(opt)
                    trackEvent('quiz_step_completed', { form: 'hero_quiz', step: 2, coverage: coverageLabel })
                    setStep(3)
                  }}
                  className="min-h-11 px-4 py-3 border border-white/12 text-sm font-medium text-left text-white/80 transition-all duration-200 hover:border-gold/40 hover:text-white"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => { setCoverage(''); setSituation(''); setStep(1) }} className="min-h-11 text-white/70 hover:text-white text-xs transition-colors">Back</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-1">Step 3 of {totalSteps}</p>
            <p className="font-serif text-white font-bold text-lg mb-1 italic">How soon are you looking to decide?</p>
            <p className="text-white/70 text-xs mb-5">Patrick will use this to understand timing.</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setUrgency(opt.label)
                    trackEvent('quiz_step_completed', { form: 'hero_quiz', step: 3, coverage: coverageLabel })
                    setStep(4)
                  }}
                  className="flex min-h-11 items-center justify-between px-4 py-3 border border-white/12 text-left transition-all duration-200 hover:border-gold/40 hover:bg-white/3"
                >
                  <div>
                    <p className="text-white/90 font-semibold text-sm">{opt.label}</p>
                    <p className="text-white/65 text-xs">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setSituation(''); setStep(2) }} className="min-h-11 text-white/70 hover:text-white text-xs transition-colors">Back</button>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-gold mb-1">Step 4 of {totalSteps}</p>
            <p className="font-serif text-white font-bold text-lg mb-1 italic">How should Patrick reach you?</p>
            <p className="text-white/75 text-xs leading-relaxed mb-5">
              Your information stays with Patrick Wilson Financial. It is not sold or distributed to multiple agents.
            </p>
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="hero-website">Website</label>
              <input
                id="hero-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-3 mb-5">
              <label htmlFor="hero-name" className="sr-only">Full name</label>
              <input
                id="hero-name"
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
              <label htmlFor="hero-phone" className="sr-only">Phone number</label>
              <input
                id="hero-phone"
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
                  <label htmlFor="hero-state" className="sr-only">State</label>
                  <select
                    id="hero-state"
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
                  <label htmlFor="hero-zip" className="sr-only">ZIP code</label>
                  <input
                    id="hero-zip"
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
              <label htmlFor="hero-email" className="sr-only">Email address</label>
              <input
                id="hero-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                className="w-full min-h-11 appearance-none bg-navy-950 border border-white/12 px-4 py-3 text-base md:text-sm text-white placeholder-white/55 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
              />
              <label htmlFor="hero-notes" className="sr-only">Additional notes</label>
              <textarea
                id="hero-notes"
                name="notes"
                placeholder="Anything you'd like us to know? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
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
                  See My Personalized Options
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-center text-white/75 text-xs mt-3">Patrick will review your request and contact you directly.</p>
            <button
              type="button"
              onClick={() => { setUrgency(''); setStep(3) }}
              className="block mx-auto mt-3 min-h-11 text-white/70 hover:text-white text-xs transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {step === 5 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 border border-gold/25 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-white font-bold text-lg mb-2 italic">You&rsquo;re all set.</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              Patrick Wilson Financial has received your request. Patrick will review
              your coverage details and contact you directly to talk through your options.
            </p>
            <div className="flex flex-col gap-3 items-center">
              {bookingUrl && (
                <a
                  href={bookingUrl}
                  onClick={() => trackEvent('booking_cta_clicked', { location: 'hero_thank_you' })}
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-navy-950 font-semibold text-sm px-5 py-3 transition-colors"
                >
                  Pick a Time
                </a>
              )}
              <a
                href="tel:+18667861585"
                onClick={() => trackEvent('phone_cta_clicked', { location: 'hero_thank_you' })}
                className="inline-flex min-h-11 items-center gap-2 text-gold font-semibold text-sm hover:text-gold-dark transition-colors"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call now: (866) 786-1585
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
