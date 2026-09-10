import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { commercialFunnel } from '@/funnels/commercial'
import { validateAllSteps } from '@/lib/quote-experience/validation'
import { composeCommercialNotes } from '@/lib/quote-experience/commercial'
import { normalizeJPLead } from '@/lib/leads/normalized'
import { buildAgencyZoomPayload } from '@/lib/integrations/agencyzoom'

const answers = { coverageNeed: 'both', industry: 'contractor', employeeRange: '5', businessName: 'Acme Builders', state: 'NC', zip: '28205', fullName: 'Jane Public', phone: '7045550142', email: 'jane@example.test' }

describe('combined General Liability and Workers Comp funnel', () => {
  it('is one short commercial funnel with a distinct visual treatment', () => {
    assert.equal(commercialFunnel.visualVariant, 'commercial')
    assert.equal(commercialFunnel.coverageLabel, 'Business Insurance')
    assert.ok(commercialFunnel.steps.length <= 8)
    assert.deepEqual(commercialFunnel.steps.slice(0, 3).map((step) => step.id), ['coverageNeed', 'industry', 'employeeRange'])
    assert.equal(validateAllSteps(commercialFunnel.steps, answers), '')
  })

  it('maps both coverage needs into one normalized commercial lead', () => {
    const normalized = normalizeJPLead(commercialFunnel.toLead(answers), '00000000-0000-4000-8000-000000000005', '2026-09-10T12:00:00.000Z')
    assert.equal(normalized.insurance_type, 'commercial_gl_wc')
    assert.equal(normalized.qualification_data.businessName, 'Acme Builders')
    assert.equal(normalized.qualification_data.coverageNeed, 'both')
    const payload = buildAgencyZoomPayload(normalized, { AGENCYZOOM_PIPELINE_ID_COMMERCIAL: '21', AGENCYZOOM_STAGE_ID_COMMERCIAL: '22', AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL: '23', AGENCYZOOM_ASSIGN_TO_COMMERCIAL: '24' })
    assert.equal(payload?.name, 'Acme Builders')
    assert.equal(payload?.businessClassification, 'contractor')
    assert.match(payload?.notes ?? '', /"employeeRange":"5"/)
    assert.match(composeCommercialNotes(commercialFunnel.toLead(answers), normalized.lead_id), /Coverage requested: General Liability and Workers Comp/)
  })
})
