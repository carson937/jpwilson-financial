'use client'

import { US_STATES } from '@/lib/licensedStates'
import { AUTO_CONSENT_TEXT, AUTO_CONSENT_VERSION } from '@/lib/quote-experience/auto'
import type { QuoteAnswers } from '@/lib/quote-experience/types'
import TextInput from './TextInput'

const selectClass = 'mt-2 h-14 w-full rounded-xl border border-navy-900/20 bg-white px-4 text-base text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold'

export default function AutoFields({ kind, answers, onAnswer, errorId }: {
  kind: 'location' | 'auto-contact' | 'preferences'
  answers: QuoteAnswers
  onAnswer: (id: string, value: string) => void
  errorId?: string
}) {
  if (kind === 'location') return <div className="space-y-5">
    <TextInput id="qx-zip" icon="pin" label="ZIP code" value={answers.zip ?? ''}
      onChange={(value) => onAnswer('zip', value.replace(/\D/g, '').slice(0, 5))}
      placeholder="5-digit ZIP code" inputMode="numeric" autoComplete="postal-code" maxLength={5} required describedBy={errorId} />
    <label className="block text-sm font-medium text-navy-900" htmlFor="qx-state">State
      <select id="qx-state" value={answers.state ?? ''} onChange={(event) => onAnswer('state', event.target.value)}
        autoComplete="address-level1" required aria-describedby={errorId} className={selectClass}>
        <option value="">Select your state</option>
        {Object.entries(US_STATES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
    </label>
  </div>

  if (kind === 'auto-contact') return <div className="space-y-5">
    <TextInput id="qx-fullName" icon="user" label="Full name" value={answers.fullName ?? ''}
      onChange={(value) => onAnswer('fullName', value)} placeholder="Full name" autoComplete="name" maxLength={120} required describedBy={errorId} />
    <TextInput id="qx-phone" icon="phone" label="Phone number" value={answers.phone ?? ''}
      onChange={(value) => onAnswer('phone', value)} placeholder="(704) 555-0142" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} required describedBy={errorId} />
  </div>

  return <div className="space-y-5">
    <TextInput id="qx-email" icon="mail" label="Email address" badge={{ text: 'Optional', tone: 'optional' }} value={answers.email ?? ''}
      onChange={(value) => onAnswer('email', value)} placeholder="you@example.com" type="email" inputMode="email" autoComplete="email" maxLength={254} describedBy={errorId} />
    <label className="block text-sm font-medium text-navy-900" htmlFor="qx-bundle">Interested in a home or renters bundle? <span className="font-normal">(Optional)</span>
      <select id="qx-bundle" value={answers.bundle ?? ''} onChange={(event) => onAnswer('bundle', event.target.value)} className={selectClass}>
        <option value="">Skip for now</option><option value="home">Home + auto</option><option value="renters">Renters + auto</option>
        <option value="no">No, auto only</option><option value="unsure">Not sure yet</option>
      </select>
    </label>
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-900/20 p-4 text-sm leading-relaxed text-navy-900" htmlFor="qx-consent">
      <input id="qx-consent" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0C1829]" required
        checked={answers.consent === AUTO_CONSENT_VERSION} aria-describedby={errorId}
        onChange={(event) => onAnswer('consent', event.target.checked ? AUTO_CONSENT_VERSION : '')} />
      <span>{AUTO_CONSENT_TEXT}</span>
    </label>
    <p className="text-xs leading-relaxed text-navy-900/75">Your request goes to JP Wilson Financial Group. <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Privacy policy</a> · <a className="underline" href="/terms" target="_blank" rel="noreferrer">Terms</a></p>
  </div>
}
