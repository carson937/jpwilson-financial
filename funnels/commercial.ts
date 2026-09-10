import { buildLeadFromAnswers } from '@/lib/quote-experience/adapter'
import type { QuoteProduct } from '@/lib/quote-experience/types'
import { contactStep, fullNameStep, stateStep, zipStep } from './shared'

export const commercialFunnel: QuoteProduct = {
  id: 'commercial', version: '1.0.0', visualVariant: 'commercial', coverageLabel: 'Business Insurance', source: 'Commercial Quote Funnel',
  intro: {
    headline: 'Protect the work you’ve built.',
    body: 'A short coverage check for General Liability and Workers’ Compensation. Share the basics now; Patrick can handle the detailed underwriting later.',
    assurances: ['One combined request', 'Built for busy owners', 'No payroll documents needed'],
    cta: 'Check My Business Coverage',
  },
  steps: [
    { kind: 'choice', id: 'coverageNeed', question: 'What would you like help with?', options: [
      { value: 'both', label: 'Both coverages', icon: 'building' }, { value: 'general_liability', label: 'General Liability', icon: 'card' },
      { value: 'workers_comp', label: 'Workers’ Comp', icon: 'user' }, { value: 'unsure', label: 'Help me decide', icon: 'user' },
    ] },
    { kind: 'choice', id: 'industry', question: 'What kind of business do you run?', options: [
      { value: 'contractor', label: 'Contractor / trade', icon: 'building' }, { value: 'retail', label: 'Retail', icon: 'building' },
      { value: 'professional', label: 'Professional service', icon: 'card' }, { value: 'restaurant', label: 'Food / hospitality', icon: 'building' },
      { value: 'other', label: 'Something else', icon: 'user' },
    ] },
    { kind: 'choice', id: 'employeeRange', question: 'About how many people work in the business?', helper: 'A simple range is enough for this first conversation.', options: [
      { value: '1', label: '1–4', icon: 'user' }, { value: '5', label: '5–10', icon: 'user' },
      { value: '11', label: '11–25', icon: 'user' }, { value: '26', label: '26+', icon: 'user' },
    ] },
    { kind: 'text', id: 'businessName', question: 'What is the business name?', placeholder: 'Business name', icon: 'building', autoComplete: 'organization' },
    stateStep(), zipStep(), fullNameStep(), { ...contactStep(), helper: 'Patrick will use this to follow up about your business coverage request.' },
  ],
  success: {
    heading: 'Request received.', subheading: 'Patrick has the basics needed to start the conversation.',
    nextStepsTitle: 'What happens next?', nextSteps: [
      'Patrick will review the business and coverage request.',
      'Detailed payroll, operations, and underwriting questions can follow privately.',
      'This request does not bind or start insurance coverage.',
    ], ctaLabel: 'Back to Home', ctaHref: '/',
  },
  toLead: (answers) => ({
    ...buildLeadFromAnswers(answers, { product: 'commercial', coverageLabel: 'Business Insurance', source: 'Commercial Quote Funnel' }),
    businessName: answers.businessName, coverageNeed: answers.coverageNeed, industry: answers.industry, employeeRange: answers.employeeRange,
  }),
}
