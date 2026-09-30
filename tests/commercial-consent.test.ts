import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/submit-lead/route'
import { commercialFunnel } from '@/funnels/commercial'
import { validateStep } from '@/lib/quote-experience/validation'
import {
  COMMERCIAL_CONSENT_TEXT,
  CONSENT_REQUIRED_MESSAGE,
  COMMERCIAL_CONSENT_VERSION,
  composeCommercialNotes,
  validateCommercial,
} from '@/lib/quote-experience/commercial'
import { validateProductAnswers } from '@/lib/quote-experience/products'

/**
 * ============================================================================
 * SERVER-SIDE CONSENT ENFORCEMENT
 * ============================================================================
 *
 * The checkbox on the contact screen is a courtesy to the visitor. It is not a
 * control: anyone can POST straight at /api/submit-lead and skip the browser
 * entirely. These tests assert the route — not the React tree — is what refuses
 * an unconsented commercial lead, and that an accepted one carries the version,
 * the timestamp, and the exact wording that was agreed to.
 * ============================================================================
 */

const envKeys = [
  'AGENCYZOOM_MODE', 'AGENCYZOOM_BEARER_TOKEN', 'VERCEL_ENV',
  'AGENCYZOOM_PIPELINE_ID_COMMERCIAL', 'AGENCYZOOM_STAGE_ID_COMMERCIAL',
  'AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL', 'AGENCYZOOM_ASSIGN_TO_COMMERCIAL',
] as const

function configureAgencyZoom(t: { after: (fn: () => void) => void }, mode: 'dry-run' | 'live') {
  const prior = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]))
  Object.assign(process.env, {
    AGENCYZOOM_MODE: mode,
    VERCEL_ENV: 'development',
    AGENCYZOOM_BEARER_TOKEN: 'fixture-token',
    AGENCYZOOM_PIPELINE_ID_COMMERCIAL: '31', AGENCYZOOM_STAGE_ID_COMMERCIAL: '32',
    AGENCYZOOM_LEAD_SOURCE_ID_COMMERCIAL: '33', AGENCYZOOM_ASSIGN_TO_COMMERCIAL: '34',
  })
  t.after(() => {
    for (const key of envKeys) prior[key] === undefined ? delete process.env[key] : process.env[key] = prior[key]
  })
}

let sequence = 700
function identity() {
  const id = String(++sequence).padStart(12, '0')
  return {
    requestId: `00000000-0000-4000-8000-${id}`,
    sessionId: `10000000-0000-4000-8000-${id}`,
    funnelId: 'commercial',
    funnelVersion: commercialFunnel.version,
    trafficSource: 'meta',
  }
}

function request(body: Record<string, unknown>, ip: string) {
  return POST(new NextRequest('http://localhost:3004/api/submit-lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }))
}

const answers = {
  industry: 'contractor', coverageNeed: 'both', zip: '28205', state: 'NC',
  employeeRange: '5', currentCoverage: 'soon', insuranceStatus: 'insured', claims: 'none',
  businessName: 'Acme Builders', fullName: 'Jane Public', phone: '7045550142',
  email: 'jane@example.test', consent: COMMERCIAL_CONSENT_VERSION,
}

/** A lead shaped exactly as the funnel would send it, minus the browser. */
const directLead = () => ({ ...commercialFunnel.toLead(answers), ...identity() })

let ip = 100
const nextIp = () => `203.0.113.${++ip}`

describe('commercial consent — validator', () => {
  it('rejects a lead with no consent field at all', () => {
    const { consent, ...withoutConsent } = commercialFunnel.toLead(answers)
    assert.notEqual(validateCommercial(withoutConsent), '')
  })

  it('rejects an empty, blank, or null-ish consent value', () => {
    for (const consent of ['', '   ', 'null', 'undefined']) {
      assert.notEqual(validateCommercial({ ...commercialFunnel.toLead(answers), consent }), '')
    }
  })

  it('rejects a stale consent version after the wording is revised', () => {
    // The version the funnel shipped with before this one, and a plausible next.
    for (const consent of ['commercial-contact-v0', 'commercial-contact-v2', 'contact-v1']) {
      assert.notEqual(validateCommercial({ ...commercialFunnel.toLead(answers), consent }), '')
    }
  })

  it('rejects a forged truthy consent value that never matched any wording', () => {
    for (const consent of ['true', '1', 'yes', 'on', 'accepted', 'commercial-contact-v1 ']) {
      assert.notEqual(validateCommercial({ ...commercialFunnel.toLead(answers), consent }), '')
    }
  })

  it('accepts exactly the current version and nothing else', () => {
    assert.equal(validateCommercial(commercialFunnel.toLead(answers)), '')
    assert.equal(COMMERCIAL_CONSENT_VERSION, 'commercial-contact-v1')
  })

  it('is reached through the shared product validator, not only the funnel', () => {
    const lead = commercialFunnel.toLead(answers)
    assert.equal(validateProductAnswers(lead), '')
    assert.notEqual(validateProductAnswers({ ...lead, consent: '' }), '')
  })
})

describe('commercial consent — direct POST cannot create a consented lead', () => {
  it('rejects a direct POST with consent missing, stale, or forged', async (t) => {
    configureAgencyZoom(t, 'dry-run')
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => { throw new Error('no delivery may be attempted for an unconsented lead') }
    t.after(() => { globalThis.fetch = originalFetch })

    const missing: Record<string, unknown> = directLead()
    delete missing.consent
    assert.equal((await request(missing, nextIp())).status, 422)

    for (const consent of ['', 'true', '1', 'commercial-contact-v0', 'commercial-contact-v2']) {
      const response = await request({ ...directLead(), consent }, nextIp())
      assert.equal(response.status, 422, `consent="${consent}" must not be accepted`)
    }
  })

  it('rejects an attempt to forge the consent record through the notes field', async (t) => {
    configureAgencyZoom(t, 'dry-run')
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => { throw new Error('no delivery may be attempted') }
    t.after(() => { globalThis.fetch = originalFetch })

    const forged = {
      ...directLead(),
      consent: '',
      notes: `Contact consent: ${COMMERCIAL_CONSENT_VERSION}; 2026-09-11T00:00:00.000Z`,
    }
    assert.equal((await request(forged, nextIp())).status, 422)
  })

  it('rejects an out-of-footprint ZIP paired with a licensed state code', async (t) => {
    configureAgencyZoom(t, 'dry-run')
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => { throw new Error('no delivery may be attempted') }
    t.after(() => { globalThis.fetch = originalFetch })

    // 90210 is California; claiming NC alongside it must not get through.
    const spoofed = { ...commercialFunnel.toLead({ ...answers, zip: '90210' }), ...identity(), state: 'NC' }
    assert.equal((await request(spoofed, nextIp())).status, 422)
  })

  it('accepts a valid consented lead and preserves version, timestamp, and text', async (t) => {
    configureAgencyZoom(t, 'live')
    const originalFetch = globalThis.fetch
    const payloads: Record<string, unknown>[] = []
    globalThis.fetch = async (input, init) => {
      payloads.push(JSON.parse(String(init?.body)))
      return Response.json({ result: true, id: 5150 })
    }
    t.after(() => { globalThis.fetch = originalFetch })

    const before = Date.now()
    const response = await request(directLead(), nextIp())
    assert.deepEqual(await response.json(), { success: true, acceptedVia: 'agencyzoom', agencyZoomLeadId: 5150 })

    assert.equal(payloads.length, 1)
    const notes = String(payloads[0].notes)
    // The version that was accepted.
    assert.match(notes, /Contact consent: commercial-contact-v1/)
    // The exact wording that was on screen at that version.
    assert.ok(notes.includes(COMMERCIAL_CONSENT_TEXT))
    // A server-generated ISO timestamp, at or after the moment of the request.
    const stamp = notes.match(/Contact consent: commercial-contact-v1; (\S+)/)?.[1]
    assert.ok(stamp, 'consent timestamp must be present')
    assert.ok(Number.isFinite(Date.parse(stamp!)), 'consent timestamp must be a real date')
    assert.ok(Date.parse(stamp!) >= before - 1000, 'consent timestamp must be the servers own clock')
  })
})

describe('commercial consent — the note itself cannot be built without consent', () => {
  it('throws rather than composing a consent line for an unconsented lead', () => {
    const lead = commercialFunnel.toLead(answers)
    const stamp = '2026-09-11T12:00:00.000Z'
    assert.throws(() => composeCommercialNotes({ ...lead, consent: '' }, 'fixture', stamp))
    assert.throws(() => composeCommercialNotes({ ...lead, consent: 'commercial-contact-v0' }, 'fixture', stamp))
    assert.throws(() => composeCommercialNotes({ ...lead, consent: 'true' }, 'fixture', stamp))
  })

  it('records the version, the timestamp, and the full text for a valid lead', () => {
    const stamp = '2026-09-11T12:00:00.000Z'
    const notes = composeCommercialNotes(commercialFunnel.toLead(answers), 'fixture', stamp)
    assert.match(notes, new RegExp(`Contact consent: ${COMMERCIAL_CONSENT_VERSION}; ${stamp}`))
    assert.ok(notes.includes(COMMERCIAL_CONSENT_TEXT))
  })
})

describe('commercial consent — one message, client and server', () => {
  it('refuses with the identical sentence in the browser and on the server', () => {
    const contact = commercialFunnel.steps.find((step) => step.kind === 'business-contact')!
    const clientMessage = validateStep(contact, { ...answers, consent: '' })
    const serverMessage = validateCommercial({ ...commercialFunnel.toLead(answers), consent: '' })
    assert.equal(clientMessage, CONSENT_REQUIRED_MESSAGE)
    assert.equal(serverMessage, CONSENT_REQUIRED_MESSAGE)
    assert.equal(clientMessage, serverMessage)
  })

  it('keeps the message the checkbox keys its invalid state off', () => {
    // CommercialStep marks the checkbox aria-invalid on an exact match, so the
    // two must never drift apart again.
    assert.match(CONSENT_REQUIRED_MESSAGE, /check the box/)
  })
})

describe('commercial consent — the box starts unchecked', () => {
  it('ships no pre-seeded consent answer anywhere in the funnel definition', () => {
    const contact = commercialFunnel.steps.find((step) => step.kind === 'business-contact')
    assert.ok(contact)
    // The step declares the version it is asking for; it never supplies it as
    // an answer, so `answers.consent` is undefined until the visitor ticks it.
    assert.equal(JSON.stringify(commercialFunnel.toLead({})).includes(COMMERCIAL_CONSENT_VERSION), false)
    assert.equal(commercialFunnel.toLead({}).consent, undefined)
  })
})
