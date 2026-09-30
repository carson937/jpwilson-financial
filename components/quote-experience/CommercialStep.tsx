'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { isValidZip } from '@/lib/leadValidation'
import { US_STATES } from '@/lib/licensedStates'
import { CONSENT_REQUIRED_MESSAGE, zipToLicensedState } from '@/lib/quote-experience/commercial'
import { OUT_OF_AREA } from '@/lib/quote-experience/validation'
import type { QuoteAnswers, QuoteStep } from '@/lib/quote-experience/types'
import TextInput from './TextInput'
import { ArrowRightIcon } from './icons'

/**
 * One commercial-funnel screen: heading, the control for the step kind, an
 * error slot, and the action row. Single-select choices carry no Continue
 * button — a pointer tap auto-advances (see QuoteFunnel) and Enter submits the
 * form for keyboard users.
 *
 * The out-of-area ZIP is not an error the visitor can fix by "trying again": it
 * gets a dedicated panel with the phone number instead of a red line.
 */

type Props = {
  step: QuoteStep
  answers: QuoteAnswers
  error: string
  submitting: boolean
  canGoBack: boolean
  autoAdvanceChoices: boolean
  onAnswer: (id: string, value: string) => void
  onChoiceSelect?: (id: string, value: string, fromPointer: boolean) => void
  onEditStep?: (stepId: string) => void
  onBack: () => void
  onContinue: () => void
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950"
    />
  )
}

export default function CommercialStep({
  step,
  answers,
  error,
  submitting,
  canGoBack,
  onAnswer,
  onChoiceSelect,
  onEditStep,
  onBack,
  onContinue,
}: Props) {
  const headingId = `qx-step-${step.id}-heading`
  const errorId = `qx-step-${step.id}-error`
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const typedStep = step.kind === 'text' || step.kind === 'zip-state' || step.kind === 'business-contact'

  /**
   * On arrival: focus the first input on a real pointer device, otherwise move
   * focus to the heading so a screen-reader user hears the new question and a
   * touch keyboard does not cover it.
   */
  useEffect(() => {
    const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
    if (fine && typedStep) firstFieldRef.current?.focus()
    else headingRef.current?.focus()
  }, [step.id, typedStep])

  const zip = answers.zip ?? ''
  const derivedState = zipToLicensedState(zip)
  const outOfArea = step.kind === 'zip-state' && isValidZip(zip) && !derivedState
  const showError = Boolean(error) && error !== OUT_OF_AREA

  const lowerError = error.toLowerCase()
  const nameInvalid = showError && lowerError.includes('name')
  const phoneInvalid = showError && lowerError.includes('phone')
  const emailInvalid = showError && lowerError.includes('email')

  const isRecap = step.kind === 'recap' || step.kind === 'business-contact'
  const choiceTwoColumn = step.kind === 'choice' && (step.id === 'industry' || step.id === 'employeeRange')
  // Choice buttons advance on pointer or explicit keyboard activation.
  const showAdvanceButton = step.kind !== 'choice'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!submitting) onContinue()
      }}
      onKeyDown={(event) => {
        // Enter in a contact text field moves focus; only an explicit button activation sends.
        if (step.kind === 'business-contact' && event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'checkbox') {
          event.preventDefault()
          const fields = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input:not([type="checkbox"]):not([tabindex="-1"]), button[type="submit"]')).filter((field) => field.getClientRects().length > 0)
          const index = fields.indexOf(event.target)
          fields[index + 1]?.focus()
        }
      }}
      noValidate
    >
      {/* Honeypot — same `website` field the site's other forms use, so the
          server's existing rejection covers this funnel too. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="qx-website">Website</label>
        <input
          id="qx-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={answers.website ?? ''}
          onChange={(event) => onAnswer('website', event.target.value)}
        />
      </div>

      <div className="min-h-[136px]" data-question-block>
      {step.id === 'coverageNeed' && <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-900/70">Business insurance · Personal guidance</p>}
      <h1
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="text-[29px] font-semibold leading-[1.12] tracking-[-0.03em] text-navy-950 outline-none focus-visible:!outline-none sm:text-[30px]"
      >
        {step.question}
      </h1>
      {step.kind === 'business-contact' && <div className="mt-4 flex items-center gap-3">
        <Image src="/patrick-wilson-headshot.png" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover object-top" />
        <p className="text-[12px] leading-relaxed text-navy-900/75"><span className="font-semibold text-navy-950">Patrick Wilson &amp; team</span><br />Personal help with your coverage.</p>
      </div>}
      {step.helper && step.kind !== 'business-contact' && (
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-navy-900/75">{step.helper}</p>
      )}

      {step.id === 'coverageNeed' && <p className="mt-3 text-[14px] text-navy-900/75">Choose one to get started. No documents needed.</p>}
      </div>
      <div className="mt-4" data-answer-block>
        {step.kind === 'choice' && (
          <div
            role="group"
            aria-labelledby={headingId}
            aria-describedby={showError ? errorId : undefined}
            className={choiceTwoColumn ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-1 gap-2.5'}
          >
            {step.options.map((option) => {
              const selected = answers[step.id] === option.value
              return (
                <button
                  type="button"
                  aria-pressed={selected}
                  data-choice-value={option.value}
                  disabled={submitting}
                  key={option.value}
                  onClick={() => onChoiceSelect?.(step.id, option.value, true)}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border min-h-[68px] px-4 py-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${
                    option.emphasis && choiceTwoColumn ? 'col-span-2 ' : ''
                  }${
                    selected
                      ? 'border-navy-900 bg-navy-950 text-white'
                      : 'border-navy-900/15 bg-white hover:border-navy-900/35'
                  }`}
                >
                  <span className="min-w-0 flex-1 break-words">
                    <span
                      className={`block text-[14.5px] font-semibold ${
                        selected ? 'text-white' : 'text-navy-950'
                      }`}
                    >
                      {option.label}<span aria-hidden="true" className={selected ? 'ml-1' : 'invisible ml-1'}>✓</span>
                    </span>
                    {option.hint && (
                      <span className={`mt-0.5 block text-[13px] leading-snug ${selected ? 'text-white/85' : 'text-navy-900/75'}`}>
                        {option.hint}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {step.kind === 'zip-state' && (
          <>
            <TextInput
              ref={firstFieldRef}
              id="qx-zip"
              icon={step.icon ?? 'pin'}
              value={zip}
              onChange={(value) => {
                const digits = value.replace(/\D/g, '').slice(0, 5)
                onAnswer('zip', digits)
                onAnswer('state', zipToLicensedState(digits) || '')
              }}
              placeholder={step.placeholder}
              labelledBy={headingId}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              required
              invalid={showError}
              describedBy={showError ? errorId : undefined}
              enterKeyHint="go"
            />
            {derivedState && !outOfArea && (
              <p className="mt-2.5 text-[13px] text-navy-900/75">
                Business location: <span className="font-medium text-navy-900/80">{US_STATES[derivedState]}</span>
              </p>
            )}
          </>
        )}

        {step.kind === 'text' && (
          <TextInput
            ref={firstFieldRef}
            id={`qx-${step.id}`}
            icon={step.icon}
            value={answers[step.id] ?? ''}
            onChange={(value) => onAnswer(step.id, value)}
            placeholder={step.placeholder}
            labelledBy={headingId}
            autoComplete={step.autoComplete}
            maxLength={120}
            required
            invalid={showError}
            describedBy={showError ? errorId : undefined}
            enterKeyHint="next"
          />
        )}

        {step.kind === 'business-contact' && (
          <div className="space-y-3.5">
            <TextInput
              ref={firstFieldRef}
              id="qx-fullName"
              icon="user"
              label="Your name"
                            value={answers.fullName ?? ''}
              onChange={(value) => onAnswer('fullName', value)}
              placeholder="First and last name"
              autoComplete="name"
              maxLength={120}
              required
              invalid={nameInvalid}
              describedBy={showError ? errorId : undefined}
              enterKeyHint="next"
            />
            <TextInput
              id="qx-phone"
              icon="phone"
              label="Phone"
                            value={answers.phone ?? ''}
              onChange={(value) => onAnswer('phone', value)}
              placeholder="(704) 555-0142"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              required
              invalid={phoneInvalid}
              describedBy={showError ? errorId : undefined}
              enterKeyHint="next"
            />
            <details open={emailInvalid || undefined}>
              <summary className="min-h-11 cursor-pointer rounded py-3 text-[13px] font-medium text-navy-900 focus-visible:outline focus-visible:outline-2">Add email (optional)</summary>
            <TextInput
              id="qx-email"
              icon="mail"
              label="Email"
              badge={{ text: 'Optional', tone: 'optional' }}
              value={answers.email ?? ''}
              onChange={(value) => onAnswer('email', value)}
              placeholder="you@company.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              invalid={emailInvalid}
              describedBy={emailInvalid ? errorId : undefined}
              enterKeyHint="go"
            />
            </details>
          </div>
        )}

        {(step.kind === 'recap' || step.kind === 'business-contact') && (
          <div className="mt-1">
            <details className="group">
              <summary className="min-h-11 cursor-pointer rounded py-3 text-[13px] font-semibold text-navy-900 focus-visible:outline focus-visible:outline-2">Review your answers</summary>
            <ul className="divide-y divide-navy-900/10 overflow-hidden rounded-[10px] border border-navy-900/15 bg-white">
              {step.summarize(answers).map((row) => (
                <li key={row.label}>
                  <button
                    type="button"
                    onClick={() => onEditStep?.(row.stepId)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gold/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy-900/25"
                  >
                    <span className="min-w-0 flex-1 break-words">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-navy-900/75">
                        {row.label}
                      </span>
                      <span className="block truncate text-[14px] text-navy-950">{row.value || '—'}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[12.5px] font-semibold text-gold-dark"
                    >
                      Edit
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            </details>

            <label className="mt-3 flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-navy-900/80">
              <input
                type="checkbox"
                aria-invalid={(showError && error === CONSENT_REQUIRED_MESSAGE) || undefined}
                aria-describedby={showError ? errorId : undefined}
                checked={answers.consent === step.consentVersion}
                onChange={(event) =>
                  onAnswer('consent', event.target.checked ? step.consentVersion : '')
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              <span>
                {step.consentText}{' '}
                {step.privacyHref && (
                  <a
                    href={step.privacyHref}
                    target="_blank" rel="noopener noreferrer"
                    className="underline decoration-navy-900/30 underline-offset-2 hover:text-navy-900"
                  >
                    Privacy policy
                  </a>
                )}
              </span>
            </label>

            {/*
              Always mounted. A live region that arrives in the DOM at the same
              moment as its text is frequently not announced — the region has to
              exist for the screen reader to be watching it. Collapsing it with
              max-height also keeps the button from jumping down when an error
              appears. Same pattern as QuestionStep.
            */}
            <p
              id={errorId}
              role="alert"
              aria-live="polite"
              className={`overflow-hidden text-[13.5px] text-red-700 transition-all duration-200 ${
                showError ? 'mt-3 max-h-24 opacity-100' : 'mt-0 max-h-0 opacity-0'
              }`}
            >
              {showError ? error : ''}
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-gold-light px-6 text-[15px] font-semibold text-navy-950 transition-colors duration-200 hover:bg-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Sending
                </>
              ) : (
                <>
                  {step.submitLabel}
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {step.id === 'coverageNeed' && (
        <div className="mt-6 flex items-center gap-3 border-t border-navy-900/10 pt-4">
          <Image src="/patrick-wilson-headshot.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover object-top" />
          <p className="text-[12px] leading-relaxed text-navy-900/75"><span className="block font-semibold text-navy-950">Patrick Wilson</span>J.P. Wilson Financial Group</p>
        </div>
      )}

      {step.kind === 'zip-state' && outOfArea && (
        <div className="mt-6 rounded-[10px] border border-navy-900/15 bg-navy-950 px-5 py-5 text-bone">
          <p className="font-serif text-[18px] font-bold">{step.outOfAreaTitle}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-bone/75">{step.outOfAreaBody}</p>
          <a
            href="tel:+18667861585"
            className="mt-4 inline-flex h-[46px] items-center justify-center rounded-[8px] bg-gold-light px-5 text-[14px] font-semibold text-navy-950 hover:bg-gold"
          >
            Call (866) 786-1585
          </a>
        </div>
      )}

      {!isRecap && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className={`overflow-hidden text-[13.5px] text-red-700 transition-all duration-200 ${
            showError ? 'mt-3 max-h-24 opacity-100' : 'mt-0 max-h-0 opacity-0'
          }`}
        >
          {showError ? error : ''}
        </p>
      )}

      {/*
        Back sits at min-h-11 (44px) — the same minimum every other control in
        this funnel already meets. The row's height is set by the taller
        Continue button beside it, so meeting it moves nothing.
      */}
      {!isRecap && (canGoBack || showAdvanceButton) && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack || submitting}
            className="-ml-2 inline-flex min-h-11 items-center rounded-lg px-3 text-[14.5px] font-medium text-navy-900/75 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30 disabled:pointer-events-none disabled:opacity-0"
          >
            Back
          </button>

          {!outOfArea && showAdvanceButton && (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-[10px] bg-gold-light px-6 text-[15px] font-semibold text-navy-950 transition-colors duration-200 hover:bg-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-900/25 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Submitting
                </>
              ) : (
                <>
                  Continue
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {isRecap && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-[14px] font-medium text-navy-900/75 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30"
          >
            Back
          </button>
        </div>
      )}
    </form>
  )
}
