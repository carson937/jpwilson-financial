'use client'

import { useState } from 'react'

const coverages = [
  { id: 'medicare',  label: 'Medicare',           sub: 'Advantage · Supplement · Part D' },
  { id: 'life',      label: 'Life Insurance',      sub: 'Term · Whole · Final Expense' },
  { id: 'auto',      label: 'Auto Insurance',      sub: 'Personal & Commercial' },
  { id: 'home',      label: 'Home Insurance',      sub: 'Homeowners · Renters · Landlord' },
  { id: 'business',  label: 'Business Insurance',  sub: 'Liability · Property · Workers Comp' },
]

const followUp: Record<string, { q: string; opts: string[] }> = {
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

export default function LeadCapture() {
  const [step, setStep]             = useState<Step>(1)
  const [coverage, setCoverage]     = useState('')
  const [situation, setSituation]   = useState('')
  const [urgency, setUrgency]       = useState('')
  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [email, setEmail]           = useState('')
  const [notes, setNotes]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const progress      = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100
  const coverageLabel = coverages.find(c => c.id === coverage)?.label ?? coverage

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Name, phone, and email are required.')
      return
    }
    setSubmitting(true)
    setError('')

    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName  = nameParts.slice(1).join(' ') || ''

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone.trim(),
          email: email.trim(),
          coverageLabel,
          situation,
          urgency,
          notes: notes.trim(),
          source: 'Hero Quiz Funnel',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again or call us directly.')
        setSubmitting(false)
        return
      }
    } catch {
      setError('Network error. Please try again or call (866) 786-1585.')
      setSubmitting(false)
      return
    }

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
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold mb-1">Step 1 of 3</p>
            <h2 className="font-serif text-white font-bold text-lg mb-5 italic">What coverage are you looking for?</h2>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {coverages.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCoverage(c.id); setStep(2) }}
                  className="flex items-center justify-between px-4 py-3 border border-white/8 text-left transition-all duration-200 group hover:border-gold/30 hover:bg-white/3"
                >
                  <div>
                    <p className="text-white/80 font-semibold text-sm">{c.label}</p>
                    <p className="text-white/50 text-[11px]">{c.sub}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/15 group-hover:text-gold transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-white/50 text-[11px]">Free · No obligation · Takes 90 seconds</p>
          </div>
        )}

        {step === 2 && coverage && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold mb-1">Step 2 of 3</p>
            <h2 className="font-serif text-white font-bold text-lg mb-1 italic">{followUp[coverage].q}</h2>
            <p className="text-white/55 text-xs mb-5">Helps us prepare the most relevant options for you.</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {followUp[coverage].opts.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSituation(opt); setStep(3) }}
                  className="px-4 py-3 border border-white/8 text-sm font-medium text-left text-white/60 transition-all duration-200 hover:border-gold/30 hover:text-white/80"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => { setCoverage(''); setSituation(''); setStep(1) }} className="text-white/20 hover:text-white/50 text-xs transition-colors">← Back</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold mb-1">Step 3 of 3</p>
            <h2 className="font-serif text-white font-bold text-lg mb-1 italic">How soon are you looking to decide?</h2>
            <p className="text-white/55 text-xs mb-5">We&rsquo;ll prioritize your review accordingly.</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setUrgency(opt.label); setStep(4) }}
                  className="flex items-center justify-between px-4 py-3 border border-white/8 text-left transition-all duration-200 hover:border-gold/30 hover:bg-white/3"
                >
                  <div>
                    <p className="text-white/80 font-semibold text-sm">{opt.label}</p>
                    <p className="text-white/50 text-[11px]">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setSituation(''); setStep(2) }} className="text-white/20 hover:text-white/50 text-xs transition-colors">← Back</button>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold mb-1">Almost Done</p>
            <h2 className="font-serif text-white font-bold text-lg mb-1 italic">Where should we send your options?</h2>
            <p className="text-white/55 text-xs mb-5">An advisor will reach out within 24 hours.</p>
            <div className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Full name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full appearance-none bg-navy-950 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
              />
              <input
                type="tel"
                placeholder="Phone number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full appearance-none bg-navy-950 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
              />
              <input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full appearance-none bg-navy-950 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors rounded-none"
              />
              <textarea
                placeholder="Anything you'd like us to know? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full appearance-none bg-navy-950 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors resize-none rounded-none"
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
            <p className="text-center text-white/55 text-[10px] mt-3">No spam. No obligation. We never sell your information.</p>
            <button
              type="button"
              onClick={() => { setUrgency(''); setStep(3) }}
              className="block mx-auto mt-3 text-white/20 hover:text-white/50 text-xs transition-colors"
            >
              ← Back
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
              Your free coverage review is being prepared. An advisor will reach out within{' '}
              <strong className="text-white/70">24 hours</strong> — usually much sooner.
            </p>
            <a
              href="tel:+18667861585"
              className="inline-flex items-center gap-2 text-gold font-semibold text-sm hover:text-gold-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call now: (866) 786-1585
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
