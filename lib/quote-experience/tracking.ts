import { trackEvent } from '@/lib/analytics'
import type { QuoteProduct, QuoteStep } from './types'

/**
 * ============================================================================
 * PRODUCT-SAFE ANALYTICS
 * ============================================================================
 *
 * Only ever: product id, funnel version, step index, step id.
 *
 * Never: names, phone numbers, emails, ZIP codes, the state answer, or the
 * Own/Rent answer. Step IDS are safe (they describe the question); step ANSWERS
 * are not, and this module gives no path for one to be passed.
 *
 * It reuses the existing event names so the current GA4/Meta configuration and
 * the "conversion fires only after an accepted submission" rule keep working
 * without a dashboard change.
 * ============================================================================
 */

type StepContext = {
  product: QuoteProduct
  step: QuoteStep
  /** 1-based, matching what the visitor sees. */
  stepNumber: number
}

function baseParams(product: QuoteProduct) {
  return { product: product.id, funnel_version: product.version }
}

export function trackFunnelStarted(product: QuoteProduct) {
  if (product.id === 'auto') return
  trackEvent('quiz_started', { ...baseParams(product), form: 'quote_experience' })
}

export function trackStepCompleted({ product, step, stepNumber }: StepContext) {
  if (product.id === 'auto') return
  trackEvent('quiz_step_completed', {
    ...baseParams(product),
    step: stepNumber,
    step_id: step.id,
  })
}

export function trackSubmissionAttempted(product: QuoteProduct) {
  if (product.id === 'auto') return
  trackEvent('form_submission_attempted', {
    ...baseParams(product),
    form: 'quote_experience',
  })
}

export function trackSubmissionSucceeded(product: QuoteProduct, acceptedVia: string) {
  if (product.id === 'auto') return
  trackEvent('form_submission_succeeded', {
    ...baseParams(product),
    form: 'quote_experience',
    accepted_via: acceptedVia,
  })
}

export function trackSubmissionFailed(product: QuoteProduct, reason: string) {
  if (product.id === 'auto') return
  trackEvent('form_submission_failed', {
    ...baseParams(product),
    form: 'quote_experience',
    reason,
  })
}
