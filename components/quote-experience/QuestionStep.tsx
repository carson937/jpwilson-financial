'use client'

import { useEffect, useRef } from 'react'
import type { QuoteAnswers, QuoteStep } from '@/lib/quote-experience/types'
import ChoiceCard from './ChoiceCard'
import ContactCapture from './ContactCapture'
import StateSelect from './StateSelect'
import TextInput from './TextInput'
import { ArrowRightIcon } from './icons'

/**
 * Renders one step of any funnel: heading, the right control for the step kind,
 * an error slot, and the Back/Continue row.
 *
 * The whole screen is a <form>, so Enter submits on every step — on mobile that
 * is the keyboard's Go/Next key, which is how people actually advance.
 */
export default function QuestionStep({
  step,
  answers,
  error,
  submitting,
  canGoBack,
  onAnswer,
  onBack,
  onContinue,
}: {
  step: QuoteStep
  answers: QuoteAnswers
  error: string
  submitting: boolean
  canGoBack: boolean
  onAnswer: (id: string, value: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  const headingId = `qx-step-${step.id}-heading`
  const errorId = `qx-step-${step.id}-error`
  const firstFieldRef = useRef<HTMLInputElement & HTMLSelectElement>(null)

  /**
   * Move focus to the field when the step changes so keyboard and screen-reader
   * users are not dropped at the top of the document on every advance.
   *
   * Deliberately NOT autofocused on touch devices — a raised keyboard on arrival
   * hides the question you are meant to read first. `matchMedia` distinguishes
   * a real pointer from a touch screen.
   */
  useEffect(() => {
    const hasFinePointer =
      typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
    if (hasFinePointer) firstFieldRef.current?.focus()
  }, [step.id])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!submitting) onContinue()
      }}
      noValidate
    >
      {/* Honeypot. Same `website` field name the Hero and Final CTA forms use,
          so the server's existing rejection rule covers this funnel too. Hidden
          from sight, from tab order, and from assistive technology — only an
          automated filler will populate it. */}
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

      <h1
        id={headingId}
        className="font-serif text-[30px] font-bold leading-[1.15] tracking-tight text-navy-900 sm:text-[32px]"
      >
        {step.question}
      </h1>
      {step.helper && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-navy-900/55">{step.helper}</p>
      )}

      <div className="mt-7">
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
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
          />
        )}

        {step.kind === 'state' && (
          <StateSelect
            ref={firstFieldRef}
            id={`qx-${step.id}`}
            icon={step.icon}
            value={answers[step.id] ?? ''}
            onChange={(value) => onAnswer(step.id, value)}
            placeholder={step.placeholder}
            labelledBy={headingId}
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
          />
        )}

        {step.kind === 'zip' && (
          <TextInput
            ref={firstFieldRef}
            id={`qx-${step.id}`}
            icon={step.icon}
            value={answers[step.id] ?? ''}
            /* Digits only, capped at five — the same shape the server enforces,
               applied as you type so an invalid ZIP is not possible to submit. */
            onChange={(value) => onAnswer(step.id, value.replace(/\D/g, '').slice(0, 5))}
            placeholder={step.placeholder}
            labelledBy={headingId}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
          />
        )}

        {step.kind === 'choice' && (
          <div
            role="radiogroup"
            aria-labelledby={headingId}
            aria-describedby={error ? errorId : undefined}
            className="grid grid-cols-2 gap-3"
          >
            {step.options.map((option) => (
              <ChoiceCard
                key={option.value}
                name={step.id}
                value={option.value}
                label={option.label}
                icon={option.icon}
                selected={answers[step.id] === option.value}
                onSelect={(value) => onAnswer(step.id, value)}
              />
            ))}
          </div>
        )}

        {step.kind === 'contact' && (
          <ContactCapture
            ref={firstFieldRef}
            phone={answers.phone ?? ''}
            email={answers.email ?? ''}
            onPhoneChange={(value) => onAnswer('phone', value)}
            onEmailChange={(value) => onAnswer('email', value)}
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
          />
        )}
      </div>

      {/* aria-live so the error is announced when it appears, not only on focus. */}
      <p
        id={errorId}
        role="alert"
        aria-live="polite"
        className={`overflow-hidden text-[13.5px] text-red-600 transition-all duration-200 ${
          error ? 'mt-3 max-h-20 opacity-100' : 'mt-0 max-h-0 opacity-0'
        }`}
      >
        {error}
      </p>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || submitting}
          className="-ml-2 rounded-lg px-2 py-2 text-[15px] font-medium text-navy-900/55 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30 disabled:pointer-events-none disabled:opacity-0"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-[52px] min-w-[168px] items-center justify-center gap-2.5 rounded-xl bg-navy-900 px-7 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-900/25 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              {/* A disabled button state, NOT a loading screen. The visitor stays
                  on this step until the server actually answers. */}
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Submitting
            </>
          ) : (
            <>
              {step.kind === 'contact' ? step.submitLabel : 'Continue'}
              <ArrowRightIcon className="h-[18px] w-[18px]" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
