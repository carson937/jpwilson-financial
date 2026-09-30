import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { commercialFunnel } from '@/funnels/commercial'
import { validateAllSteps, validateStep } from '@/lib/quote-experience/validation'
import {
  COMMERCIAL_CONSENT_VERSION,
  composeCommercialNotes,
  validateCommercial,
} from '@/lib/quote-experience/commercial'
import { normalizeJPLead } from '@/lib/leads/normalized'
import { buildAgencyZoomPayload } from '@/lib/integrations/agencyzoom'
import type { BusinessContactStep, ZipStateStep } from '@/lib/quote-experience/types'

/** Server-supplied submission timestamp; the consent record travels with it. */
const FIXED_STAMP = '2026-09-11T12:00:00.000Z'

const answers = {
  industry: 'contractor',
  coverageNeed: 'both',
  zip: '28205',
  state: 'NC',
  employeeRange: '5',
  currentCoverage: 'soon',
  claims: 'none',
  insuranceStatus: 'insured',
  businessName: 'Acme Builders',
  fullName: 'Jane Public',
  phone: '7045550142',
  email: 'jane@example.test',
  consent: COMMERCIAL_CONSENT_VERSION,
}

describe('combined General Liability and Workers Comp funnel', () => {
  it('is one short commercial funnel with the short v4 flow', () => {
    assert.equal(commercialFunnel.visualVariant, 'commercial')
    assert.equal(commercialFunnel.version, '5.0.0')
    assert.equal(commercialFunnel.autoAdvanceChoices, true)
    assert.equal(commercialFunnel.coverageLabel, 'Business Insurance')
    assert.equal(commercialFunnel.source, 'Commercial Quote Funnel')
    assert.deepEqual(
      commercialFunnel.steps.map((step) => step.id),
      ['industry', 'zip', 'employeeRange', 'currentCoverage', 'insuranceStatus', 'claims', 'contact'],
    )
    // Six screens including contact and consent; GL skips employees.
    assert.equal(commercialFunnel.steps.filter((step) => step.kind !== 'recap').length, 7)
    assert.equal(validateAllSteps(commercialFunnel.steps, answers), '')
  })

  it('derives the state from the business ZIP and gates on the licensed footprint', () => {
    const zipStep = commercialFunnel.steps.find((step) => step.kind === 'zip-state') as ZipStateStep
    assert.equal(validateStep(zipStep, { zip: '28205' }), '')
    assert.equal(validateStep(zipStep, { zip: '29401' }), '') // Charleston SC
    assert.equal(validateStep(zipStep, { zip: '30301' }), '') // Atlanta GA
    assert.equal(validateStep(zipStep, { zip: '37201' }), '') // Nashville TN
    assert.equal(validateStep(zipStep, { zip: '2820' }), 'Please enter a valid 5-digit ZIP code.')
    assert.equal(validateStep(zipStep, { zip: '90210' }), 'out-of-area') // CA — turned away
  })

  it('requires the consent box on the contact screen before it can submit', () => {
    const recapStep = commercialFunnel.steps.find((step) => step.kind === 'business-contact') as BusinessContactStep
    assert.notEqual(validateStep(recapStep, { ...answers, consent: '' }), '')
    assert.equal(validateStep(recapStep, answers), '')
    // The recap summary carries every collected answer for review.
    const rows = recapStep.summarize(answers)
    assert.deepEqual(
      rows.map((row) => row.label),
      ['Type of work', 'Business ZIP', 'Employees', 'Reason / timing', 'Insurance status', 'Claims'],
    )
    assert.equal(rows.find((row) => row.label === 'Business ZIP')?.value, '28205 · NC')
  })

  it('blocks a half-answered funnel from the new questions', () => {
    const { currentCoverage, ...missingCoverage } = answers
    assert.notEqual(validateAllSteps(commercialFunnel.steps, missingCoverage), '')
    const { claims, ...missingClaims } = answers
    assert.notEqual(validateAllSteps(commercialFunnel.steps, missingClaims), '')
    const { consent, ...missingConsent } = answers
    assert.notEqual(validateAllSteps(commercialFunnel.steps, missingConsent), '')
  })

  it('maps both coverage needs into one normalized commercial lead', () => {
    const lead = commercialFunnel.toLead(answers)
    assert.equal(lead.coverageLabel, 'Business Insurance')
    assert.equal(lead.source, 'Commercial Quote Funnel')
    assert.equal(lead.notes, '')
    assert.equal(lead.consent, COMMERCIAL_CONSENT_VERSION)

    const normalized = normalizeJPLead(lead, '00000000-0000-4000-8000-000000000005', '2026-09-10T12:00:00.000Z')
    assert.equal(normalized.insurance_type, 'commercial_gl_wc')
    assert.equal(normalized.qualification_data.businessName, 'Acme Builders')
    assert.equal(normalized.qualification_data.coverageNeed, 'both')
    assert.equal(normalized.qualification_data.currentCoverage, 'soon')
    assert.equal(normalized.qualification_data.claims, 'none')

    const payload = buildAgencyZoomPayload(normalized, { AGENCYZOOM_PIPELINE_ID_COMMERCIAL: '21', AGENCYZOOM_STAGE_ID_COMMERCIAL: '22', AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL: '23', AGENCYZOOM_ASSIGN_TO_COMMERCIAL: '24' })
    assert.equal(payload?.name, 'Acme Builders')
    assert.equal(payload?.contactName, 'Jane Public')
    assert.equal(payload?.businessClassification, 'contractor')
    assert.match(payload?.notes ?? '', /"employeeRange":"5"/)
    assert.match(payload?.notes ?? '', /"currentCoverage":"soon"/)

    const notes = composeCommercialNotes(lead, normalized.lead_id, FIXED_STAMP)
    assert.match(notes, /Coverage requested: General Liability and Workers Comp/)
    assert.match(notes, /Current coverage: Renews within 30 days/)
    assert.match(notes, /Claims \(last 3 yrs\): None/)
  })
})


describe('commercial v3 branch and minimal capture contract', () => {
  const minimal = { insuranceStatus: 'uninsured', claims: 'none', employeeRange: '0', coverageNeed: 'unsure', industry: 'other', zip: '28205', state: 'NC', currentCoverage: 'job', fullName: 'Jane Public', phone: '7045550142', consent: COMMERCIAL_CONSENT_VERSION }
  it('accepts advisor-guided capture without business name, claims, or email', () => {
    assert.equal(validateAllSteps(commercialFunnel.steps, minimal), '')
    assert.equal(validateCommercial(commercialFunnel.toLead(minimal)), '')
    assert.equal(commercialFunnel.steps.filter(s => !s.visibleWhen || s.visibleWhen(minimal)).length, 7)
  })
  it('requires employee relevance for WC, both and unsure; accepts zero and unsure', () => {
    for (const coverageNeed of ['workers_comp', 'both', 'unsure']) {
      assert.notEqual(validateAllSteps(commercialFunnel.steps, { ...minimal, coverageNeed, employeeRange: '' }), '')
      assert.notEqual(validateCommercial(commercialFunnel.toLead({ ...minimal, coverageNeed, employeeRange: '' })), '')
      for (const employeeRange of ['0', 'unsure']) {
        const value = { ...minimal, coverageNeed, employeeRange }
        assert.equal(validateAllSteps(commercialFunnel.steps, value), '')
        assert.equal(validateCommercial(commercialFunnel.toLead(value)), '')
      }
    }
  })
  it('drops stale employee answers when coverage switches to GL without inventing underwriting data', () => {
    const lead = commercialFunnel.toLead({ ...minimal, coverageNeed: 'general_liability', employeeRange: '26' })
    assert.equal(lead.employeeRange, undefined)
    const normalized = normalizeJPLead(lead, '00000000-0000-4000-8000-000000000006', '2026-09-11T12:00:00.000Z')
    const payload = buildAgencyZoomPayload(normalized, { AGENCYZOOM_PIPELINE_ID_COMMERCIAL: '21', AGENCYZOOM_STAGE_ID_COMMERCIAL: '22', AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL: '23', AGENCYZOOM_ASSIGN_TO_COMMERCIAL: '24' })
    assert.ok(payload)
    assert.ok(!JSON.parse(JSON.stringify(payload)).name)
    assert.ok(!('numberOfEmployees' in payload))
    assert.equal(normalized.funnel_answers.consent, COMMERCIAL_CONSENT_VERSION)
  })
  it('does not turn an absent claims answer into a claim-free statement', () => {
    assert.match(composeCommercialNotes({ ...minimal, claims: undefined }, 'fixture', FIXED_STAMP), /Claims .*: Not collected/)
    assert.notEqual(validateCommercial({ ...minimal, currentCoverage: 'invented' }), '')
  })
})

it('maps unasked coverage to advisor guidance, never a fabricated selection of both', () => {
 const lead = commercialFunnel.toLead({industry:'other',employeeRange:'0'});
 assert.equal(lead.coverageNeed, 'unsure');
 assert.equal(commercialFunnel.startAtFirstStep, false);
})


it('keeps the exact locked v5 order and excludes heavy underwriting inputs', () => {
  assert.deepEqual(commercialFunnel.steps.map(s => s.id), ['industry', 'zip', 'employeeRange', 'currentCoverage', 'insuranceStatus', 'claims', 'contact'])
  assert.equal(commercialFunnel.steps.filter(s => s.kind === 'choice').length, 5)
  const data = JSON.stringify(commercialFunnel.steps)
  assert.doesNotMatch(data, /tax.?id|fein|payroll|revenue|bankruptcy|policy.?number|loss.?runs/i)
  const lead = commercialFunnel.toLead({ ...answers, insuranceStatus: 'uninsured', claims: 'open' })
  const normalized = normalizeJPLead(lead, '00000000-0000-4000-8000-000000000007', '2026-09-11T12:00:00.000Z')
  assert.equal(normalized.funnel_answers.insuranceStatus, 'uninsured')
  assert.equal(normalized.qualification_data.claims, 'open')
  assert.match(composeCommercialNotes(lead, normalized.lead_id, FIXED_STAMP), /Insurance status: No current coverage/)
  assert.match(composeCommercialNotes(lead, normalized.lead_id, FIXED_STAMP), /Current or open claim/)
})
