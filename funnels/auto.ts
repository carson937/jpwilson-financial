import { buildLeadFromAnswers } from '@/lib/quote-experience/adapter'
import type { QuoteProduct } from '@/lib/quote-experience/types'

export const autoFunnel: QuoteProduct = {
  id: 'auto', version: '1.0.0', coverageLabel: 'Auto Insurance',
  // Preserve the existing confirmed downstream source enum. Notes identify Auto v1.
  source: 'Hero Quiz Funnel',
  intro: {
    headline: 'Auto Insurance. Personal Guidance.',
    body: 'Tell us a little about what you need. Patrick will help you explore your auto insurance options.',
    assurances: ['No obligation', 'A real advisor', 'No VIN or license details needed'],
    cta: 'Start My Auto Request',
  },
  steps: [
    { kind: 'choice', id: 'insured', question: 'Do you have auto insurance right now?', options: [
      { value: 'yes', label: 'Yes', icon: 'card' }, { value: 'no', label: 'No', icon: 'card' },
    ] },
    { kind: 'location', id: 'location', question: 'Where do you need coverage?', helper: 'Your ZIP code and state help us check our service area.' },
    { kind: 'choice', id: 'timing', question: 'When do you want coverage to start?', options: [
      { value: 'now', label: 'As soon as possible', icon: 'card' },
      { value: '30_days', label: 'Within 30 days', icon: 'card' },
      { value: '90_days', label: 'Within 90 days', icon: 'card' },
      { value: 'researching', label: 'Just exploring', icon: 'card' },
    ] },
    { kind: 'choice', id: 'vehicles', question: 'How many vehicles need coverage?', options: [
      { value: '1', label: '1 vehicle', icon: 'card' }, { value: '2', label: '2 vehicles', icon: 'card' },
      { value: '3', label: '3 vehicles', icon: 'card' }, { value: '4_plus', label: '4 or more', icon: 'card' },
    ] },
    { kind: 'choice', id: 'driving', question: 'Any incidents in the past 5 years?', helper: 'Accidents, claims, tickets, or suspensions. You can discuss details privately with Patrick later.', options: [
      { value: 'none', label: 'None', icon: 'card' }, { value: 'some', label: 'Yes', icon: 'card' },
      { value: 'discuss', label: 'Discuss with Patrick', icon: 'user' },
    ] },
    { kind: 'auto-contact', id: 'contact', question: 'Who should Patrick contact?', helper: 'We’ll only send your request after you agree on the next screen.' },
    { kind: 'preferences', id: 'preferences', question: 'Ready to send your request?', helper: 'Email and bundle interest are optional. Please review the contact consent below.' },
  ],
  success: {
    heading: 'Thank you!', subheading: 'Your auto insurance request has been received.',
    nextStepsTitle: 'What happens next?', nextSteps: [
      'Patrick will review your request and follow up.',
      'Any vehicle, driver, or coverage details can be discussed privately.',
      'This request does not bind or start insurance coverage.',
    ], ctaLabel: 'Back to Home', ctaHref: '/',
  },
  toLead: (answers) => ({
    ...buildLeadFromAnswers(answers, { product: 'auto', coverageLabel: 'Auto Insurance', source: 'Hero Quiz Funnel' }),
    insured: answers.insured, timing: answers.timing, vehicles: answers.vehicles,
    driving: answers.driving, bundle: answers.bundle ?? '', consent: answers.consent ?? '',
  }),
}
