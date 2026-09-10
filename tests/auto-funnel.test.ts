import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { randomUUID, createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { autoFunnel } from '@/funnels/auto'
import { AUTO_CONSENT_VERSION, composeAutoNotes } from '@/lib/quote-experience/auto'
import { validateAllSteps } from '@/lib/quote-experience/validation'
import { parseBrowserEvent, sourceBucket } from '@/lib/quote-experience/telemetry'
import { forwardAutoEvent } from '@/lib/quote-experience/telemetry-server'
import { POST } from '@/app/api/submit-lead/route'
import { POST as observe } from '@/app/api/auto-events/route'

const answers = { insured: 'yes', state: 'NC', zip: '28205', timing: '30_days', vehicles: '2', driving: 'discuss', fullName: 'Jane Public', phone: '7045550142', email: '', bundle: '', consent: AUTO_CONSENT_VERSION }
const browser = () => ({ event: 'step_view' as const, eventId: randomUUID(), sessionId: randomUUID(), source: 'direct' as const, step: 'contact' as const, occurredAt: new Date().toISOString() })
const body = (overrides = {}) => ({ ...autoFunnel.toLead(answers), requestId: randomUUID(), sessionId: randomUUID(), autoSource: 'direct', ...overrides })
const post = (value: unknown) => POST(new NextRequest('http://localhost/api/submit-lead', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': randomUUID() }, body: JSON.stringify(value) }))

describe('Auto V1 and privacy boundaries', () => {
  it('matches the agreed order, with heavy intake deferred', () => {
    assert.deepEqual(autoFunnel.steps.map(s => s.id), ['insured','location','timing','vehicles','driving','contact','preferences'])
    assert.equal(validateAllSteps(autoFunnel.steps, answers), '')
    for (const field of ['vin', 'driverLicense', 'dob', 'claims']) assert.ok(!Object.keys(autoFunnel.toLead(answers)).includes(field))
  })
  it('rejects unsupported states and invalid ZIP before contact', () => {
    assert.match(validateAllSteps(autoFunnel.steps, { ...answers, state: 'CA', phone: '' }), /cannot accept/)
    assert.match(validateAllSteps(autoFunnel.steps, { ...answers, zip: '2820' }), /ZIP/)
  })
  it('requires explicit consent but permits missing email and bundle', () => {
    assert.match(validateAllSteps(autoFunnel.steps, { ...answers, consent: '' }), /agree/)
    assert.match(validateAllSteps(autoFunnel.steps, { ...answers, email: 'broken' }), /email/)
    assert.equal(validateAllSteps(autoFunnel.steps, answers), '')
  })
  it('uses the existing source/category and server-built notes, not guessed fields', () => {
    const lead = autoFunnel.toLead(answers)
    assert.equal(lead.coverageLabel, 'Auto Insurance'); assert.equal(lead.source, 'Hero Quiz Funnel'); assert.equal(lead.notes, '')
    const notes = composeAutoNotes(answers, randomUUID(), new Date().toISOString())
    assert.ok(notes.length <= 1000); assert.match(notes, /Driving history.*discuss/); assert.match(notes, /Contact consent/)
    assert.throws(() => composeAutoNotes({ ...answers, driving: 'private free text' }, randomUUID(), new Date().toISOString()))
  })
  it('rejects contact details, arbitrary answers and forged confirmations from browser telemetry', () => {
    assert.ok(parseBrowserEvent(browser()))
    for (const injected of [{ email: 'jane@example.com' }, { answer: 'yes' }, { step: 'jane@example.com' }, { event: 'crm_confirmed' }, { event: 'submission_accepted' }, { acceptedVia: 'jotform' }]) assert.equal(parseBrowserEvent({ ...browser(), ...injected }), null)
    assert.equal(sourceBucket('?utm_source=jane%40example.com', ''), 'other')
    assert.equal(sourceBucket('?utm_source=facebook&email=private', ''), 'meta')
  })
  it('signs only the safe event envelope and reports telemetry failure honestly', async t => {
    const oldFetch = globalThis.fetch
    const oldUrl = process.env.JP_AUTO_TELEMETRY_URL, oldSecret = process.env.JP_AUTO_TELEMETRY_SECRET
    process.env.JP_AUTO_TELEMETRY_URL = 'https://telemetry.example.test/api/telemetry/jp-auto'; process.env.JP_AUTO_TELEMETRY_SECRET = 'fixture-only'
    t.after(() => { globalThis.fetch = oldFetch; if (oldUrl === undefined) delete process.env.JP_AUTO_TELEMETRY_URL; else process.env.JP_AUTO_TELEMETRY_URL = oldUrl; if (oldSecret === undefined) delete process.env.JP_AUTO_TELEMETRY_SECRET; else process.env.JP_AUTO_TELEMETRY_SECRET = oldSecret })
    globalThis.fetch = async (_url, init) => {
      const h = new Headers(init?.headers), raw = String(init?.body)
      assert.equal(h.get('x-caps-signature'), createHmac('sha256','fixture-only').update(`${h.get('x-caps-timestamp')}.${raw}`).digest('hex'))
      assert.ok(!raw.includes('phone'))
      return new Response('', { status: 503 })
    }
    assert.equal(await forwardAutoEvent(browser()), false)
  })
  it('refuses missing consent and undeclared underwriting data without outbound calls', async t => {
    const oldFetch = globalThis.fetch; let calls = 0
    globalThis.fetch = async () => { calls++; throw new Error('must not deliver') }; t.after(() => { globalThis.fetch = oldFetch })
    assert.equal((await post(body({ consent: '' }))).status, 422)
    assert.equal((await post(body({ driverLicense: 'never send' }))).status, 400)
    assert.equal((await post(body({ driving: 'free text details' }))).status, 400)
    assert.equal(calls, 0)
  })
  it('preserves Jotform field names and requires positive acceptance, never CRM success', async t => {
    const oldFetch = globalThis.fetch; let payload: URLSearchParams | undefined
    globalThis.fetch = async (_url, init) => { payload = new URLSearchParams(String(init?.body)); return new Response('Thank You', { status: 200 }) }
    t.after(() => { globalThis.fetch = oldFetch })
    const request = body(), result = await post(request)
    assert.equal(result.status, 200)
    assert.deepEqual(await result.json(), { success: true, acceptedVia: 'jotform' })
    assert.equal(payload?.get('q5_q5_dropdown3'), 'Auto Insurance')
    assert.equal(payload?.get('q10_leadSource'), 'Hero Quiz Funnel')
    assert.match(payload?.get('q8_q8_textarea6') ?? '', new RegExp(request.requestId))
    assert.equal(payload?.get('q12_state'), 'NC')
    globalThis.fetch = async () => new Response('<html>maintenance</html>', { status: 200 })
    assert.equal((await post(body())).status, 502)
  })
  it('attempts configured fallback on primary transport failure', async t => {
    const oldFetch = globalThis.fetch, oldFallback = process.env.LEAD_FALLBACK_WEBHOOK_URL
    process.env.LEAD_FALLBACK_WEBHOOK_URL = 'https://fallback.example.test'
    let calls = 0
    globalThis.fetch = async () => { if (++calls === 1) throw new Error('timeout'); return new Response('', { status: 200 }) }
    t.after(() => { globalThis.fetch = oldFetch; if (oldFallback === undefined) delete process.env.LEAD_FALLBACK_WEBHOOK_URL; else process.env.LEAD_FALLBACK_WEBHOOK_URL = oldFallback })
    const result = await post(body()); assert.equal(result.status, 200); assert.equal((await result.json()).acceptedVia, 'fallback'); assert.equal(calls, 2)
  })
  it('blocks cross-origin analytics and browser-forged accepted events', async () => {
    const request = (value: unknown, origin: string) => new NextRequest('http://localhost/api/auto-events', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(value) })
    assert.equal((await observe(request(browser(), 'https://attacker.test'))).status, 403)
    assert.equal((await observe(request({ ...browser(), event: 'submission_accepted' }, 'http://localhost'))).status, 400)
  })
})
