import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeJPLead } from '@/lib/leads/normalized'
import { buildAgencyZoomPayload, submitAgencyZoomLead } from '@/lib/integrations/agencyzoom'
import { autoFunnel } from '@/funnels/auto'

const autoAnswers = { insured: 'yes', state: 'NC', zip: '28205', timing: '30_days', vehicles: '2', driving: 'none', fullName: 'Jane Public', phone: '7045550142', email: 'jane@example.test', bundle: 'home', consent: 'auto-contact-v1' }
const ids = { AGENCYZOOM_PIPELINE_ID_AUTO: '11', AGENCYZOOM_STAGE_ID_AUTO: '12', AGENCYZOOM_LEAD_SOURCE_ID_AUTO: '13', AGENCYZOOM_ASSIGN_TO_AUTO: '14' }

describe('AgencyZoom lead adapter', () => {
  it('normalizes attribution, answers, downstream fields, and stable IDs before delivery', () => {
    const lead = autoFunnel.toLead(autoAnswers)
    Object.assign(lead, { funnelId: 'auto', funnelVersion: '1.0.0', trafficSource: 'meta', campaignId: 'cmp-1', contentId: 'creative-2', adId: 'ad-3', batchId: 'batch-4', utmSource: 'instagram' })
    const normalized = normalizeJPLead(lead, '00000000-0000-4000-8000-000000000001', '2026-09-10T12:00:00.000Z')
    assert.equal(normalized.lead_id, '00000000-0000-4000-8000-000000000001')
    assert.equal(normalized.attribution.campaign_id, 'cmp-1')
    assert.equal(normalized.funnel_answers.vehicles, '2')
    assert.equal(normalized.downstream.coverage_label, 'Auto Insurance')
    assert.equal(normalized.agencyzoom_handoff_status, 'pending')
  })

  it('builds the documented AgencyZoom personal-lead payload without inventing account IDs', () => {
    const normalized = normalizeJPLead(autoFunnel.toLead(autoAnswers), '00000000-0000-4000-8000-000000000002', '2026-09-10T12:00:00.000Z')
    assert.equal(buildAgencyZoomPayload(normalized, {}), null)
    const payload = buildAgencyZoomPayload(normalized, ids)
    assert.deepEqual({ pipelineId: payload?.pipelineId, stageId: payload?.stageId, leadSourceId: payload?.leadSourceId, assignTo: payload?.assignTo, country: payload?.country }, { pipelineId: 11, stageId: 12, leadSourceId: 13, assignTo: 14, country: 'USA' })
    assert.equal(payload?.firstname, 'Jane')
    assert.match(payload?.notes ?? '', /"lead_id"/)
  })

  it('dry-runs without network access and returns the exact payload for review', async () => {
    let calls = 0
    const normalized = normalizeJPLead(autoFunnel.toLead(autoAnswers), '00000000-0000-4000-8000-000000000003', '2026-09-10T12:00:00.000Z')
    const result = await submitAgencyZoomLead(normalized, { env: { ...ids, AGENCYZOOM_MODE: 'dry-run', VERCEL_ENV: 'development' }, fetcher: async () => { calls += 1; throw new Error('network forbidden') } })
    assert.equal(result.status, 'dry_run')
    assert.equal(result.accepted, true)
    assert.equal(calls, 0)
  })

  it('refuses dry-run as an accepted delivery in production', async () => {
    const normalized = normalizeJPLead(autoFunnel.toLead(autoAnswers), '00000000-0000-4000-8000-000000000009', '2026-09-10T12:00:00.000Z')
    const result = await submitAgencyZoomLead(normalized, { env: { ...ids, AGENCYZOOM_MODE: 'dry-run', VERCEL_ENV: 'production' } })
    assert.equal(result.accepted, false)
    assert.equal(result.reason, 'agencyzoom_dry_run_forbidden_in_production')
  })

  it('uses the official personal lead endpoint and returns the AgencyZoom ID', async () => {
    let url = '', authorization = ''
    const normalized = normalizeJPLead(autoFunnel.toLead(autoAnswers), '00000000-0000-4000-8000-000000000004', '2026-09-10T12:00:00.000Z')
    const result = await submitAgencyZoomLead(normalized, { env: { ...ids, AGENCYZOOM_MODE: 'live', AGENCYZOOM_BEARER_TOKEN: 'fixture-token' }, fetcher: async (input, init) => {
      url = String(input); authorization = new Headers(init?.headers).get('authorization') ?? ''
      return new Response(JSON.stringify({ id: 9123, result: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    } })
    assert.equal(url, 'https://api.agencyzoom.com/v1/api/leads/create')
    assert.equal(authorization, 'Bearer fixture-token')
    assert.equal(result.agencyZoomLeadId, 9123)
  })
})
