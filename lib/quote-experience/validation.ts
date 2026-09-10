import {
  isValidOptionalEmail,
  isValidState,
  isValidUSPhone,
  isValidZip,
  normalizeText,
  hasNameLetter,
} from '@/lib/leadValidation'
import { LICENSED_STATES } from '@/lib/licensedStates'
import { AUTO_CONSENT_VERSION, validAutoValue } from './auto'
import type { QuoteAnswers, QuoteStep } from './types'

/**
 * Step-level validation, composed from the SAME helpers the API route uses.
 * Duplicating the rules here would guarantee the two drift apart and let a
 * visitor pass the client only to be rejected by the server.
 *
 * The server remains the authority. This exists so errors appear next to the
 * field instead of after a round trip.
 */

/** A name needs a real character, not just punctuation or spaces. */
function hasNameContent(value: string) {
  return /[a-z]/i.test(value)
}

/**
 * Returns a visitor-facing error for the step, or '' when the step may advance.
 * The contact step validates both of its inputs; phone required, email only
 * when the visitor actually typed one.
 */
export function validateStep(step: QuoteStep, answers: QuoteAnswers): string {
  switch (step.kind) {
    case 'location':
      if (!isValidZip(answers.zip ?? '')) return 'Please enter a valid 5-digit ZIP code.'
      if (!answers.state) return 'Please select your state.'
      return LICENSED_STATES.some((state) => state === answers.state) ? '' : 'We cannot accept auto requests in this state. No contact details have been sent.'
    case 'auto-contact':
      if (!hasNameLetter(answers.fullName ?? '')) return 'Please enter your full name.'
      return isValidUSPhone(answers.phone ?? '') ? '' : 'Please enter a valid phone number.'
    case 'preferences':
      if (!isValidOptionalEmail(answers.email ?? '')) return 'Please enter a valid email address, or leave it blank.'
      if (!validAutoValue('bundle', answers.bundle ?? '')) return 'Please choose a bundle option or leave it blank.'
      return answers.consent === AUTO_CONSENT_VERSION ? '' : 'Please agree to contact about your request before submitting.'
    case 'text': {
      const value = normalizeText(answers[step.id] ?? '', 120)
      if (!value) return 'Please enter your name.'
      if (!hasNameContent(value)) return 'Please enter your name.'
      return ''
    }

    case 'state': {
      const value = (answers[step.id] ?? '').toUpperCase()
      if (!value) return 'Please select your state.'
      if (!isValidState(value)) return 'Please select your state.'
      return ''
    }

    case 'zip': {
      const value = answers[step.id] ?? ''
      if (!value) return 'Please enter your ZIP code.'
      if (!isValidZip(value)) return 'Please enter a valid 5-digit ZIP code.'
      return ''
    }

    case 'choice': {
      const value = answers[step.id] ?? ''
      if (!value) return 'Please choose an option to continue.'
      if (!step.options.some((option) => option.value === value)) {
        return 'Please choose an option to continue.'
      }
      return ''
    }

    case 'contact': {
      const phone = answers.phone ?? ''
      const email = answers.email ?? ''
      if (!phone) return 'Please enter your phone number.'
      if (!isValidUSPhone(phone)) return 'Please enter a valid phone number.'
      if (email && !isValidOptionalEmail(email)) {
        return 'Please enter a valid email address, or leave it blank.'
      }
      return ''
    }
  }
}

/** Guards the submit call: every step must pass, not just the last one. */
export function validateAllSteps(
  steps: ReadonlyArray<QuoteStep>,
  answers: QuoteAnswers,
): string {
  for (const step of steps) {
    const error = validateStep(step, answers)
    if (error) return error
  }
  return ''
}
