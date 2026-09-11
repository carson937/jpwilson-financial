import { buildLeadFromAnswers } from '@/lib/quote-experience/adapter'
import {
  COMMERCIAL_CONSENT_TEXT,
  COMMERCIAL_CONSENT_VERSION,
  commercialLabel,
} from '@/lib/quote-experience/commercial'
import type { QuoteProduct } from '@/lib/quote-experience/types'

export const commercialFunnel: QuoteProduct = {
  id: 'commercial',
  version: '5.0.0',
  visualVariant: 'commercial',
  autoAdvanceChoices: true,
  startAtFirstStep: false,
  coverageLabel: 'Business Insurance',
  source: 'Commercial Quote Funnel',

  intro: {
    headline: 'Get help protecting the business you’re building.',
    body: 'Tell us a little about your business. We’ll help you explore General Liability and Workers’ Comp.',
    assurances: ['No documents needed to start'],
    cta: 'Find my coverage options',
    phone: '(866) 786-1585',
  },

  steps: [
    {
      kind: 'choice',
      id: 'industry',
      question: 'What kind of business do you run?',
      helper: 'Pick the closest fit.',
      options: [
        { value: 'contractor', label: 'Contractor / trades' },
        { value: 'cleaning', label: 'Cleaning / janitorial' },
        { value: 'retail', label: 'Retail / shop' },
        { value: 'restaurant', label: 'Food / hospitality' },
        { value: 'professional', label: 'Professional / office' },
        { value: 'auto_service', label: 'Auto service / repair' },
        { value: 'fitness', label: 'Health / fitness / salon' },
        { value: 'other', label: 'Something else' },
      ],
    },
    {
      kind: 'zip-state',
      id: 'zip',
      question: 'What’s the business ZIP code?',
      helper: 'We help businesses in NC, SC, GA and TN.',
      placeholder: 'ZIP code',
      icon: 'pin',
      outOfAreaTitle: 'That’s outside our licensed area',
      outOfAreaBody:
        'JP Wilson Financial Group is licensed in North Carolina, South Carolina, Georgia, and Tennessee. We can’t take this request — and nothing has been sent. If that ZIP isn’t right, edit it above. Otherwise, give Patrick a call at (866) 786-1585.',
    },
    {
      kind: 'choice',
      id: 'employeeRange',
      question: 'How many employees, excluding owners?',
      helper: 'A range is fine. Not sure who counts? Choose “Not sure.”',
      options: [
        { value: '0', label: 'No employees' },
        { value: '1', label: '1–4' },
        { value: '5', label: '5–10' },
        { value: '11', label: '11–25' },
        { value: '26', label: '26+' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      kind: 'choice',
      id: 'currentCoverage',
      question: 'What brings you here today?',
      options: [
        { value: 'none', label: 'Need my first coverage' },
        { value: 'job', label: 'Need coverage for a job or contract' },
        { value: 'soon', label: 'Renewing within 30 days' },
        { value: 'review', label: 'Comparing options / renewing later' },
        { value: 'unsure', label: 'Not sure — I’d like guidance' },
      ],
    },
    {
      kind: 'choice',
      id: 'insuranceStatus',
      question: 'Do you currently have business insurance?',
      options: [
        { value: 'insured', label: 'Yes, I have coverage' },
        { value: 'uninsured', label: 'No coverage right now' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      kind: 'choice',
      id: 'claims',
      question: 'Any open claims or claims in the past 3 years?',
      options: [
        { value: 'none', label: 'No' },
        { value: 'open', label: 'Yes — a current or open claim' },
        { value: 'past', label: 'Yes — a past claim' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      kind: 'business-contact',
      id: 'contact',
      question: 'How should we reach you?',
      helper: 'Patrick and the J.P. Wilson team will follow up about your options.',
      submitLabel: 'Submit my request',
      consentText: COMMERCIAL_CONSENT_TEXT,
      consentVersion: COMMERCIAL_CONSENT_VERSION,
      privacyHref: '/privacy',
      summarize: (answers) => [
        { label: 'Type of work', value: commercialLabel('industry', answers.industry), stepId: 'industry' },
        {
          label: 'Business ZIP',
          value: [answers.zip, answers.state].filter(Boolean).join(' · '),
          stepId: 'zip',
        },
        ...(answers.coverageNeed !== 'general_liability' ? [{ label: 'Employees', value: commercialLabel('employeeRange', answers.employeeRange), stepId: 'employeeRange' }] : []),
        { label: 'Reason / timing', value: commercialLabel('currentCoverage', answers.currentCoverage), stepId: 'currentCoverage' },
        { label: 'Insurance status', value: commercialLabel('insuranceStatus', answers.insuranceStatus), stepId: 'insuranceStatus' },
        { label: 'Claims', value: commercialLabel('claims', answers.claims), stepId: 'claims' },
      ],
    },
  ],

  success: {
    heading: 'Request received.',
    subheading: 'Patrick has what he needs to start on your options.',
    nextStepsTitle: 'What happens next',
    nextSteps: [
      'Patrick reviews the business and the coverage you asked about.',
      'He reaches out — typically within one business day — for the few underwriting details (payroll, operations).',
      'Nothing here binds coverage or starts a policy.',
    ],
    ctaLabel: 'Back to JP Wilson Financial',
    ctaHref: '/',
  },

  toLead: (answers) => ({
    ...buildLeadFromAnswers(answers, {
      product: 'commercial',
      coverageLabel: 'Business Insurance',
      source: 'Commercial Quote Funnel',
    }),
    businessName: answers.businessName,
    coverageNeed: answers.coverageNeed || 'unsure',
    industry: answers.industry,
    employeeRange: answers.coverageNeed === 'general_liability' ? undefined : answers.employeeRange,
    currentCoverage: answers.currentCoverage,
    claims: answers.claims,
    insuranceStatus: answers.insuranceStatus,
    consent: answers.consent,
  }),
}
