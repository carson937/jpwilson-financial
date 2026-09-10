import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/submit-lead/route'
import { autoFunnel } from '@/funnels/auto'
import { lifeFunnel } from '@/funnels/life'
import { commercialFunnel } from '@/funnels/commercial'

const envKeys = [
  'AGENCYZOOM_MODE', 'AGENCYZOOM_BEARER_TOKEN', 'VERCEL_ENV',
  'AGENCYZOOM_PIPELINE_ID_AUTO', 'AGENCYZOOM_STAGE_ID_AUTO', 'AGENCYZOOM_LEAD_SOURCE_ID_AUTO', 'AGENCYZOOM_ASSIGN_TO_AUTO',
  'AGENCYZOOM_PIPELINE_ID_LIFE', 'AGENCYZOOM_STAGE_ID_LIFE', 'AGENCYZOOM_LEAD_SOURCE_ID_LIFE', 'AGENCYZOOM_ASSIGN_TO_LIFE',
  'AGENCYZOOM_PIPELINE_ID_COMMERCIAL', 'AGENCYZOOM_STAGE_ID_COMMERCIAL', 'AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL', 'AGENCYZOOM_ASSIGN_TO_COMMERCIAL',
] as const

function configureAgencyZoom(t: { after: (fn: () => void) => void }, mode: 'dry-run' | 'live') {
  const prior = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
  Object.assign(process.env, {
    AGENCYZOOM_MODE: mode,
    VERCEL_ENV: 'development',
    AGENCYZOOM_BEARER_TOKEN: 'fixture-token',
    AGENCYZOOM_PIPELINE_ID_AUTO: '11', AGENCYZOOM_STAGE_ID_AUTO: '12', AGENCYZOOM_LEAD_SOURCE_ID_AUTO: '13', AGENCYZOOM_ASSIGN_TO_AUTO: '14',
    AGENCYZOOM_PIPELINE_ID_LIFE: '21', AGENCYZOOM_STAGE_ID_LIFE: '22', AGENCYZOOM_LEAD_SOURCE_ID_LIFE: '23', AGENCYZOOM_ASSIGN_TO_LIFE: '24',
    AGENCYZOOM_PIPELINE_ID_COMMERCIAL: '31', AGENCYZOOM_STAGE_ID_COMMERCIAL: '32', AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL: '33', AGENCYZOOM_ASSIGN_TO_COMMERCIAL: '34',
  })
  t.after(() => {
    for (const key of envKeys) prior[key] === undefined ? delete process.env[key] : process.env[key] = prior[key]
  })
}

let sequence = 100
function identity(product: 'auto' | 'life' | 'commercial') {
  const id = String(++sequence).padStart(12, '0')
  return {
    requestId: `00000000-0000-4000-8000-${id}`,
    sessionId: `10000000-0000-4000-8000-${id}`,
    funnelId: product,
    funnelVersion: '1.0.0',
    trafficSource: 'meta',
    platform: 'instagram', campaignId: 'campaign-1', contentId: 'creative-2', adId: 'ad-3', batchId: 'batch-4',
    utmSource: 'instagram', utmMedium: 'paid-social', utmCampaign: 'jp-test', utmContent: 'creative-2', utmTerm: '',
    referralSource: 'instagram', referralHost: 'l.instagram.com',
  }
}

function request(body: Record<string, unknown>, ip: string) {
  return POST(new NextRequest('http://localhost:3004/api/submit-lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }))
}

const autoAnswers = { insured: 'yes', state: 'NC', zip: '28205', timing: '30_days', vehicles: '2', driving: 'none', fullName: 'Jane Public', phone: '7045550142', email: 'jane@example.test', bundle: 'home', consent: 'auto-contact-v1' }
const lifeAnswers = { fullName: 'Jane Public', state: 'NC', zip: '28205', homeOwnership: 'Own', phone: '7045550142', email: 'jane@example.test' }
const commercialAnswers = { coverageNeed: 'both', industry: 'contractor', employeeRange: '5', businessName: 'Acme Builders', state: 'NC', zip: '28205', fullName: 'Jane Public', phone: '7045550142', email: 'jane@example.test' }

describe('AgencyZoom-first route proof', () => {
  it('safely accepts Auto, Life, and combined commercial payloads without a network call', async (t) => {
    configureAgencyZoom(t, 'dry-run')
    const originalFetch = globalThis.fetch
    let calls = 0
    globalThis.fetch = async () => { calls += 1; throw new Error('network must remain unused') }
    t.after(() => { globalThis.fetch = originalFetch })

    const cases = [
      { product: autoFunnel, productId: 'auto', answers: autoAnswers, ip: '198.51.100.101' },
      { product: lifeFunnel, productId: 'life', answers: lifeAnswers, ip: '198.51.100.102' },
      { product: commercialFunnel, productId: 'commercial', answers: commercialAnswers, ip: '198.51.100.103' },
    ] as const
    for (const item of cases) {
      const body = { ...item.product.toLead(item.answers), ...identity(item.productId) }
      const response = await request(body, item.ip)
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { success: true, acceptedVia: 'agencyzoom_dry_run' })
    }
    assert.equal(calls, 0)
  })

  it('returns and reuses the AgencyZoom identifier for an accepted duplicate Auto lead', async (t) => {
    configureAgencyZoom(t, 'live')
    const originalFetch = globalThis.fetch
    let calls = 0
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), 'https://api.agencyzoom.com/v1/api/leads/create')
      calls += 1
      return new Response(JSON.stringify({ id: 7788, result: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    t.after(() => { globalThis.fetch = originalFetch })
    const body = { ...autoFunnel.toLead(autoAnswers), ...identity('auto') }
    const first = await request(body, '198.51.100.104')
    const duplicate = await request(body, '198.51.100.104')
    assert.deepEqual(await first.json(), { success: true, acceptedVia: 'agencyzoom', agencyZoomLeadId: 7788 })
    assert.deepEqual(await duplicate.json(), { success: true, acceptedVia: 'agencyzoom', agencyZoomLeadId: 7788 })
    assert.equal(calls, 1)
  })

  it('preserves the lead through the established downstream intake when AgencyZoom is unavailable', async (t) => {
    configureAgencyZoom(t, 'live')
    const originalFetch = globalThis.fetch
    const urls: string[] = []
    let fallbackBody = ''
    globalThis.fetch = async (input, init) => {
      const url = String(input)
      urls.push(url)
      if (url.includes('api.agencyzoom.com')) return new Response(JSON.stringify({ result: false }), { status: 503, headers: { 'content-type': 'application/json' } })
      fallbackBody = String(init?.body ?? '')
      return new Response('Thank You', { status: 200 })
    }
    t.after(() => { globalThis.fetch = originalFetch })
    const body = { ...autoFunnel.toLead(autoAnswers), ...identity('auto') }
    const response = await request(body, '198.51.100.105')
    assert.deepEqual(await response.json(), { success: true, acceptedVia: 'jotform' })
    assert.ok(urls.some((url) => url.includes('/v1/api/leads/create')))
    assert.ok(urls.some((url) => url.includes('submit.jotform.com')))
    assert.match(new URLSearchParams(fallbackBody).get('q8_q8_textarea6') ?? '', /Auto Quote Funnel v1/)
  })
})
