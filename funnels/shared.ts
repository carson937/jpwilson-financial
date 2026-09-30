import type { ContactStep, StateStep, TextStep, ZipStep } from '@/lib/quote-experience/types'

/**
 * Step builders shared by every product funnel.
 *
 * Name, state, ZIP, and contact are required by the API for ANY lead, so every
 * funnel asks them and every funnel should ask them identically. Product-specific
 * questions (Own/Rent for Life, vehicles for Auto) belong in the product file.
 *
 * Copy is overridable per product but defaults to the approved wording.
 */

const DEFAULT_HELPER = 'This helps us provide accurate options.'

export function fullNameStep(overrides: Partial<TextStep> = {}): TextStep {
  return {
    kind: 'text',
    id: 'fullName',
    question: 'What is your full name?',
    helper: DEFAULT_HELPER,
    placeholder: 'Full name',
    icon: 'user',
    autoComplete: 'name',
    ...overrides,
  }
}

export function stateStep(overrides: Partial<StateStep> = {}): StateStep {
  return {
    kind: 'state',
    id: 'state',
    question: 'What is your state of residence?',
    helper: DEFAULT_HELPER,
    placeholder: 'Select your state',
    icon: 'pin',
    ...overrides,
  }
}

export function zipStep(overrides: Partial<ZipStep> = {}): ZipStep {
  return {
    kind: 'zip',
    id: 'zip',
    question: 'What is your ZIP code?',
    helper: DEFAULT_HELPER,
    placeholder: 'ZIP code',
    icon: 'card',
    ...overrides,
  }
}

/**
 * The combined contact screen — always last, always one screen.
 * Its `id` is 'contact' but it writes the `phone` and `email` answer keys.
 */
export function contactStep(overrides: Partial<ContactStep> = {}): ContactStep {
  return {
    kind: 'contact',
    id: 'contact',
    question: 'How should we contact you?',
    helper: 'We’ll use this to send your quote (within 24 hours).',
    submitLabel: 'Submit Request',
    ...overrides,
  }
}
