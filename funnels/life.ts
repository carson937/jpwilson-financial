import { buildLeadFromAnswers } from '@/lib/quote-experience/adapter'
import type { QuoteProduct } from '@/lib/quote-experience/types'
import { contactStep, fullNameStep, stateStep, zipStep } from './shared'

/**
 * ============================================================================
 * LIFE INSURANCE QUOTE FUNNEL — v1 (LOCKED)
 * ============================================================================
 *
 * Five questions. That is the product decision, not a starting point:
 *
 *   1 Full name   2 State   3 ZIP   4 Own or rent   5 Contact (phone + email)
 *
 * Do NOT add date of birth, gender, tobacco, health, coverage amount, marital
 * status, children, income, or employment. Those were reviewed and deliberately
 * moved to JP's follow-up call. Several of them are also regulated data with no
 * approved destination in the current Jotform/Zapier path.
 *
 * There is no loading or interstitial screen. Submit → real response → success.
 * ============================================================================
 */

export const lifeFunnel: QuoteProduct = {
  id: 'life',
  version: '1.0.0',

  /**
   * VERIFIED against the live Jotform question list: q5 offers exactly
   * `Medicare | Life Insurance | Auto Insurance | Home Insurance | Business Insurance`.
   * This string must stay byte-identical or the downstream mapping silently
   * mis-sorts the lead. A test asserts it.
   */
  coverageLabel: 'Life Insurance',

  /** New source value. Distinguishes funnel leads from the two legacy forms. */
  source: 'Life Quote Funnel',

  intro: {
    headline: 'Life Insurance Made Simple.',
    body: 'Answer a few quick questions and we’ll help you find the right life insurance coverage for you and your loved ones.',
    // Each of these must be literally true. "No Obligation" and "100%
    // Confidential" describe the actual process; the time estimate reflects
    // five short questions.
    assurances: ['No Obligation', '100% Confidential', 'Takes Less Than 2 Minutes'],
    cta: 'Start My Quote',
  },

  steps: [
    fullNameStep(),
    stateStep(),
    zipStep(),
    {
      kind: 'choice',
      id: 'homeOwnership',
      question: 'Do you own or rent your home?',
      helper: 'This helps us provide accurate options.',
      options: [
        { value: 'Own', label: 'Own', icon: 'home' },
        { value: 'Rent', label: 'Rent', icon: 'building' },
      ],
    },
    contactStep(),
  ],

  success: {
    heading: 'Thank You!',
    subheading: 'We’ve received your request.',
    nextStepsTitle: 'What happens next?',
    nextSteps: [
      'We’ll review your information',
      'A licensed member of our team will reach out',
      'You can expect a call or text within 24 hours',
    ],
    ctaLabel: 'Back to Home',
    ctaHref: '/',
  },

  toLead: (answers) =>
    buildLeadFromAnswers(answers, {
      product: 'life',
      coverageLabel: 'Life Insurance',
      source: 'Life Quote Funnel',
    }),
}
