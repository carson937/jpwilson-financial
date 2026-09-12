'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { isValidZip } from '@/lib/leadValidation'
import { zipToLicensedState } from '@/lib/quote-experience/commercial'
import { createRequestId, submitQuoteLead } from '@/lib/quote-experience/submit'
import {
  trackFunnelStarted,
  trackStepCompleted,
  trackSubmissionAttempted,
  trackSubmissionFailed,
  trackSubmissionSucceeded,
} from '@/lib/quote-experience/tracking'
import type { QuoteAnswers, QuoteProduct, QuoteStep } from '@/lib/quote-experience/types'
import { validateAllSteps, validateStep } from '@/lib/quote-experience/validation'
import LandingHero from './LandingHero'
import QuestionStep from './QuestionStep'
import QuoteShell from './QuoteShell'
import SuccessScreen from './SuccessScreen'
import CommercialShell from './CommercialShell'
import CommercialHero from './CommercialHero'
import { useFunnelTelemetry } from './useAutoTelemetry'

/**
 * ============================================================================
 * QUOTE FUNNEL — configuration-driven shell
 * ============================================================================
 *
 * Renders ANY QuoteProduct. Nothing here knows about life insurance; swap the
 * `product` prop and the same shell runs the auto or commercial funnel.
 *
 * Phases: intro → one screen per step → success. There is no loading phase.
 * The submit button shows a disabled/submitting state in place, and the success
 * screen appears only after the server confirms the lead was accepted.
 *
 * The commercial funnel uses a distinct editorial chrome (CommercialShell /
 * CommercialHero) and auto-advances single-select choices; everything else —
 * state, history, validation, telemetry, submission — is the shared path.
 *
 * DATA HANDLING
 * Answers live in component state and nowhere else — no localStorage, no
 * sessionStorage, no cookies, no query strings. Closing the tab discards them,
 * which is what "Your information is secure" has to mean to be honest.
 * ============================================================================
 */

/** Phase -1 is the intro; 0..n-1 are steps; `done` is the success screen. */
const INTRO = -1

/** How long a fresh pointer selection sits visible before the funnel advances. */
const AUTO_ADVANCE_MS = 200
const AUTO_ADVANCE_REDUCED_MS = 200

function adaptStep(product: QuoteProduct, step: QuoteStep, answers: QuoteAnswers): QuoteStep {
  let next = step
  if (product.id === 'auto' && next.id === 'timing' && answers.insured === 'yes') {
    next = { ...next, question: 'When is your current policy up for renewal?' }
  }
  if (product.adaptStep) next = product.adaptStep(next, answers)
  return next
}

export default function QuoteFunnel({ product }: { product: QuoteProduct }) {
  const [stepIndex, setStepIndex] = useState(product.startAtFirstStep ? 0 : INTRO)
  const [answers, setAnswers] = useState<QuoteAnswers>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [dryRun, setDryRun] = useState(false)

  /**
   * One id per completed funnel, generated at the first submit attempt and
   * REUSED on retry. It is what lets the server recognise a repeat of the same
   * lead rather than a second one.
   */
  const requestIdRef = useRef<string>('')
  /** Guards against a double-fire (double tap, Enter + click) racing itself. */
  const inFlightRef = useRef(false)

  const commercial = product.visualVariant === 'commercial'
  const visibleSteps = product.steps.filter((s) => !s.visibleWhen || s.visibleWhen(answers))
  const totalSteps = product.steps.length
  const rawStep = stepIndex >= 0 ? product.steps[stepIndex] : null
  const step = rawStep ? adaptStep(product, rawStep, answers) : null
  const { emit, identity } = useFunnelTelemetry(product.id as 'auto' | 'life' | 'commercial', product.version, step?.id, done)
  const doneRef = useRef(false)

  /** Progress: the recap/consent screen is not a numbered step. */
  const progressTotal = visibleSteps.filter((s) => s.kind !== 'recap').length
  const progressCurrent = Math.min(visibleSteps.findIndex((s) => s.id === rawStep?.id) + 1, progressTotal)
  const editReturnRef = useRef(false)
  const startedRef = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers
  useEffect(() => {
    if (product.startAtFirstStep) window.history.replaceState({ ...window.history.state, qxStep: 0 }, '')
  }, [product.startAtFirstStep])

  // --- auto-advance plumbing --------------------------------------------------
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepIndexRef = useRef(stepIndex)
  const handleContinueRef = useRef<() => void>(() => {})
  useEffect(() => { stepIndexRef.current = stepIndex }, [stepIndex])

  const clearAutoAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }, [])

  // Any step change (forward, Back, popstate) cancels a pending advance.
  useEffect(() => clearAutoAdvance, [stepIndex, clearAutoAdvance])

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
      clearAutoAdvance()
      // Leaving the funnel entirely (or landing on a foreign entry) is handled
      // by the browser; we only reposition when our own state is present.
      if (!doneRef.current && !inFlightRef.current && typeof state?.qxStep === 'number' && Number.isInteger(state.qxStep) && state.qxStep >= INTRO && state.qxStep < product.steps.length) {
        let target = state.qxStep
        while (target > 0 && product.steps[target].visibleWhen && !product.steps[target].visibleWhen!(answersRef.current)) target--
        setStepIndex(target)
        setError('')
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [product.steps, clearAutoAdvance])

  const goToStep = useCallback((next: number, push: boolean) => {
    clearAutoAdvance()
    setStepIndex(next)
    setError('')
    if (push) {
      window.history.pushState({ ...window.history.state, qxStep: next }, '')
    }
    // Return to the top of the card; a long step can otherwise leave the next
    // question's heading scrolled out of view on a short viewport.
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [clearAutoAdvance])

  const handleAnswer = useCallback((id: string, value: string) => {
    if (product.startAtFirstStep && !startedRef.current) {
      startedRef.current = true
      trackFunnelStarted(product)
      emit('funnel_start')
    }
    setAnswers((current) => {
      const next = { ...current, [id]: value }
      if (commercial && id === 'coverageNeed' && value === 'general_liability') delete next.employeeRange
      return next
    })
    // Clear the error the moment the visitor acts on it. Leaving a stale error
    // under a field they have just fixed reads as broken.
    setError('')
  }, [commercial, product, emit])

  /**
   * A single-select choice was picked. On a genuine pointer tap we advance on
   * our own after a short beat; on a keyboard selection we do not — the visitor
   * presses Enter (the form submits) or the Continue control when they are
   * ready. A re-tap simply reschedules.
   */
  const handleChoiceSelect = useCallback((id: string, value: string, fromPointer: boolean) => {
    handleAnswer(id, value)
    if (!product.autoAdvanceChoices || !fromPointer) return
    clearAutoAdvance()
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const forStep = stepIndexRef.current
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null
      if (stepIndexRef.current !== forStep || inFlightRef.current) return
      handleContinueRef.current()
    }, reduced ? AUTO_ADVANCE_REDUCED_MS : AUTO_ADVANCE_MS)
  }, [handleAnswer, product.autoAdvanceChoices, clearAutoAdvance])

  const handleStart = useCallback(() => {
    trackFunnelStarted(product)
    emit('funnel_start')
    // Seed a history entry for the intro so the first Back returns here rather
    // than exiting to the previous site.
    window.history.replaceState({ ...window.history.state, qxStep: INTRO }, '')
    goToStep(0, true)
  }, [goToStep, product, emit])

  const handleBack = useCallback(() => {
    clearAutoAdvance()
    if (step) emit('step_back', { step: step.id })
    // Delegate to the browser so the history stack and the UI never disagree.
    window.history.back()
  }, [clearAutoAdvance, emit, step])

  const handleSubmit = useCallback(async () => {
    if (inFlightRef.current) return

    const validationError = validateAllSteps(product.steps, answers)
    if (validationError) {
      setError(validationError)
      if (step) emit('validation_error', { step: step.id })
      return
    }

    if (!requestIdRef.current) requestIdRef.current = createRequestId()

    inFlightRef.current = true
    setSubmitting(true)
    setError('')
    trackSubmissionAttempted(product)
    emit('submit_attempt', { requestId: requestIdRef.current })

    const lead = { ...product.toLead(answers), website: answers.website ?? '', funnelId: product.id, funnelVersion: product.version,
      ...(identity.current ? { sessionId: identity.current.sessionId, autoSource: identity.current.source, ...identity.current.attribution } : {}),
    }
    const result = await submitQuoteLead(lead, requestIdRef.current)

    inFlightRef.current = false
    setSubmitting(false)

    if (result.ok) {
      setDryRun(result.acceptedVia === 'agencyzoom_dry_run')
      trackSubmissionSucceeded(product, result.acceptedVia)
      // The confirmation view has no need for contact details. Release them
      // from component memory as soon as delivery is confirmed.
      setAnswers({})
      doneRef.current = true
      setDone(true)
      // Replace, not push: Back from the success screen must not re-open the
      // contact step and invite a second submission.
      window.history.replaceState({ ...window.history.state, qxDone: true }, '')
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    trackSubmissionFailed(product, result.reason)
    setError(result.message)
  }, [answers, product, emit, identity, step])

  const handleContinue = useCallback(() => {
    if (!step) return
    clearAutoAdvance()

    const stepError = validateStep(step, answers)
    if (stepError) {
      setError(stepError)
      emit('validation_error', { step: step.id })
      return
    }

    trackStepCompleted({ product, step, stepNumber: stepIndex + 1 })
    emit('step_answer', { step: step.id })
    if (step.kind === 'contact' || step.kind === 'auto-contact' || step.kind === 'business-contact') {
      emit('contact_capture', { step: step.id })
    }

    if (stepIndex === totalSteps - 1) {
      void handleSubmit()
      return
    }

    if (editReturnRef.current) {
      const missing = product.steps.findIndex((candidate) => candidate.kind !== 'business-contact' && Boolean(validateStep(candidate, answers)))
      if (missing >= 0) { goToStep(missing, true); return }
      editReturnRef.current = false
      goToStep(totalSteps - 1, true)
      return
    }
    let next = stepIndex + 1
    while (next < totalSteps && product.steps[next].visibleWhen && !product.steps[next].visibleWhen!(answers)) next++
    goToStep(next, true)
  }, [answers, clearAutoAdvance, goToStep, handleSubmit, product, step, stepIndex, totalSteps, emit])

  useEffect(() => { handleContinueRef.current = handleContinue }, [handleContinue])

  /** Jump straight to a step by id — used by the recap screen's "edit" links. */
  const handleEditStep = useCallback((stepId: string) => {
    const index = product.steps.findIndex((s) => s.id === stepId)
    if (index >= 0) {
      editReturnRef.current = commercial
      goToStep(index, true)
    }
  }, [commercial, goToStep, product.steps])

  // --- commercial render ----------------------------------------------------
  if (commercial) {
    if (done) {
      return (
        <CommercialShell showProgress={false}>
          <SuccessScreen success={dryRun ? { ...product.success, heading: 'Preview complete.', subheading: 'Your test request passed validation. Nothing was sent to an advisor.', nextStepsTitle: 'Local test only', nextSteps: ['The AgencyZoom adapter accepted this request in dry-run mode.', 'No live CRM record or policy was created.'] } : product.success} />
        </CommercialShell>
      )
    }
    if (!step) return <CommercialHero intro={product.intro} onStart={handleStart} />
    /**
     * The out-of-area panel owns the phone CTA on that one screen, so the
     * shell's quiet "Prefer to talk?" link stands down rather than repeating
     * the same number directly beneath it.
     */
    const commercialOutOfArea =
      step.kind === 'zip-state' && isValidZip(answers.zip ?? '') && !zipToLicensedState(answers.zip ?? '')
    return (
      <CommercialShell
        showProgress={step.kind !== 'recap'}
        progressCurrent={progressCurrent}
        progressTotal={progressTotal}
        showCallLink={!commercialOutOfArea}
      >
        <QuestionStep
          variant="commercial"
          step={step}
          answers={answers}
          error={error}
          submitting={submitting}
          canGoBack={stepIndex > 0 || !product.startAtFirstStep}
          autoAdvanceChoices={Boolean(product.autoAdvanceChoices)}
          onAnswer={handleAnswer}
          onChoiceSelect={handleChoiceSelect}
          onEditStep={handleEditStep}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      </CommercialShell>
    )
  }

  // --- classic render (auto / life) ---------------------------------------
  if (done) {
    return (
      <QuoteShell step={null} totalSteps={totalSteps} variant={product.visualVariant}>
        <SuccessScreen success={product.success} autoRequestId={product.id === 'auto' ? requestIdRef.current : undefined}
          onBookingClick={() => emit('booking_click', { requestId: requestIdRef.current })} />
      </QuoteShell>
    )
  }

  if (!step) {
    return (
      <QuoteShell step={null} totalSteps={totalSteps} variant={product.visualVariant}>
        <LandingHero intro={product.intro} onStart={handleStart} variant={product.visualVariant} />
      </QuoteShell>
    )
  }

  return (
    <QuoteShell step={stepIndex + 1} totalSteps={totalSteps} variant={product.visualVariant}>
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
