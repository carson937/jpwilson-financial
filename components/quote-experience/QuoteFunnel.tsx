'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRequestId, submitQuoteLead } from '@/lib/quote-experience/submit'
import {
  trackFunnelStarted,
  trackStepCompleted,
  trackSubmissionAttempted,
  trackSubmissionFailed,
  trackSubmissionSucceeded,
} from '@/lib/quote-experience/tracking'
import type { QuoteAnswers, QuoteProduct } from '@/lib/quote-experience/types'
import { validateAllSteps, validateStep } from '@/lib/quote-experience/validation'
import LandingHero from './LandingHero'
import QuestionStep from './QuestionStep'
import QuoteShell from './QuoteShell'
import SuccessScreen from './SuccessScreen'

/**
 * ============================================================================
 * QUOTE FUNNEL — configuration-driven shell
 * ============================================================================
 *
 * Renders ANY QuoteProduct. Nothing here knows about life insurance; swap the
 * `product` prop and the same shell runs the auto or home funnel.
 *
 * Phases: intro → one screen per step → success. There is no loading phase.
 * The submit button shows a disabled/submitting state in place, and the success
 * screen appears only after the server confirms the lead was accepted.
 *
 * DATA HANDLING
 * Answers live in component state and nowhere else — no localStorage, no
 * sessionStorage, no cookies, no query strings. Closing the tab discards them,
 * which is what "Your information is secure" has to mean to be honest.
 * ============================================================================
 */

/** Phase -1 is the intro; 0..n-1 are steps; `done` is the success screen. */
const INTRO = -1

export default function QuoteFunnel({ product }: { product: QuoteProduct }) {
  const [stepIndex, setStepIndex] = useState(INTRO)
  const [answers, setAnswers] = useState<QuoteAnswers>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  /**
   * One id per completed funnel, generated at the first submit attempt and
   * REUSED on retry. It is what lets the server recognise a repeat of the same
   * lead rather than a second one.
   */
  const requestIdRef = useRef<string>('')
  /** Guards against a double-fire (double tap, Enter + click) racing itself. */
  const inFlightRef = useRef(false)

  const totalSteps = product.steps.length
  const step = stepIndex >= 0 ? product.steps[stepIndex] : null

  /**
   * Browser Back moves one screen back instead of leaving the site.
   *
   * Only the step INDEX goes into history state — never an answer. Nothing
   * about the visitor is recoverable from the URL, the history entry, or a
   * shared link.
   */
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as { qxStep?: number } | null
      // Leaving the funnel entirely (or landing on a foreign entry) is handled
      // by the browser; we only reposition when our own state is present.
      if (typeof state?.qxStep === 'number') {
        setStepIndex(state.qxStep)
        setError('')
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToStep = useCallback((next: number, push: boolean) => {
    setStepIndex(next)
    setError('')
    if (push) {
      window.history.pushState({ qxStep: next }, '')
    }
    // Return to the top of the card; a long step can otherwise leave the next
    // question's heading scrolled out of view on a short viewport.
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleAnswer = useCallback((id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    // Clear the error the moment the visitor acts on it. Leaving a stale error
    // under a field they have just fixed reads as broken.
    setError('')
  }, [])

  const handleStart = useCallback(() => {
    trackFunnelStarted(product)
    // Seed a history entry for the intro so the first Back returns here rather
    // than exiting to the previous site.
    window.history.replaceState({ qxStep: INTRO }, '')
    goToStep(0, true)
  }, [goToStep, product])

  const handleBack = useCallback(() => {
    // Delegate to the browser so the history stack and the UI never disagree.
    window.history.back()
  }, [])

  const handleSubmit = useCallback(async () => {
    if (inFlightRef.current) return

    const validationError = validateAllSteps(product.steps, answers)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!requestIdRef.current) requestIdRef.current = createRequestId()

    inFlightRef.current = true
    setSubmitting(true)
    setError('')
    trackSubmissionAttempted(product)

    const lead = { ...product.toLead(answers), website: answers.website ?? '' }
    const result = await submitQuoteLead(lead, requestIdRef.current)

    inFlightRef.current = false
    setSubmitting(false)

    if (result.ok) {
      trackSubmissionSucceeded(product, result.acceptedVia)
      // The confirmation view has no need for contact details. Release them
      // from component memory as soon as delivery is confirmed.
      setAnswers({})
      requestIdRef.current = ''
      setDone(true)
      // Replace, not push: Back from the success screen must not re-open the
      // contact step and invite a second submission.
      window.history.replaceState({ qxDone: true }, '')
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    trackSubmissionFailed(product, result.reason)
    setError(result.message)
  }, [answers, product])

  const handleContinue = useCallback(() => {
    if (!step) return

    const stepError = validateStep(step, answers)
    if (stepError) {
      setError(stepError)
      return
    }

    trackStepCompleted({ product, step, stepNumber: stepIndex + 1 })

    if (stepIndex === totalSteps - 1) {
      void handleSubmit()
      return
    }

    goToStep(stepIndex + 1, true)
  }, [answers, goToStep, handleSubmit, product, step, stepIndex, totalSteps])

  if (done) {
    return (
      <QuoteShell step={null} totalSteps={totalSteps}>
        <SuccessScreen success={product.success} />
      </QuoteShell>
    )
  }

  if (!step) {
    return (
      <QuoteShell step={null} totalSteps={totalSteps}>
        <LandingHero intro={product.intro} onStart={handleStart} />
      </QuoteShell>
    )
  }

  return (
    <QuoteShell step={stepIndex + 1} totalSteps={totalSteps}>
      <QuestionStep
        step={step}
        answers={answers}
        error={error}
        submitting={submitting}
        /* Back from the first question returns to the intro, which is a real
           history entry seeded on Start — so it is always available. */
        canGoBack
        onAnswer={handleAnswer}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    </QuoteShell>
  )
}
