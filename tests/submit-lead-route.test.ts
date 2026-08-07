import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import { GET, OPTIONS, POST } from '@/app/api/submit-lead/route'

let sequence = 0

function validLead(overrides: Record<string, unknown> = {}) {
  return {
    firstName: 'Jane',
    lastName: 'Public',
    phone: '(704) 555-0142',
    email: 'jane@example.com',
    state: 'NC',
    zip: '28205',
    coverageLabel: 'Life Insurance',
    situation: '',
    urgency: '',
    notes: '',
    source: 'Life Quote Funnel',
    product: 'life',
    homeOwnership: 'Own',
    requestId: `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
    ...overrides,
  }
}

function post(body: unknown, options: { contentType?: string; origin?: string; ip?: string } = {}) {
  return POST(
    new NextRequest('http://localhost:3004/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': options.contentType ?? 'application/json',
        'x-forwarded-for': options.ip ?? `198.51.100.${sequence + 1}`,
        ...(options.origin ? { Origin: options.origin } : {}),
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
}

async function responseJson(response: Response) {
  return response.json() as Promise<{ success?: boolean; error?: string }>
}

function mockJotform(t: { after: (fn: () => void) => void }, result: Response | Error) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => {
    if (result instanceof Error) throw result
    return result.clone()
  }
  t.after(() => {
    globalThis.fetch = originalFetch
  })
}

describe('submit-lead request boundary', () => {
  it('delivers a complete Life request only after Jotform accepts it', async (t) => {
    mockJotform(t, new Response('Thank You', { status: 200 }))
    const response = await post(validLead())
    assert.equal(response.status, 200)
    assert.deepEqual(await responseJson(response), { success: true, acceptedVia: 'jotform' })
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0')
  })

  it('continues to accept the two established legacy-form payload shapes', async (t) => {
    mockJotform(t, new Response('Thank You', { status: 200 }))

    const hero = await post(
      validLead({
        product: undefined,
        homeOwnership: undefined,
        source: 'Hero Quiz Funnel',
        situation: 'Protect my family',
        urgency: 'ASAP',
        notes: 'Please call after 5pm.',
      }),
    )
    assert.equal(hero.status, 200)

    const finalCta = await post(
      validLead({
        product: undefined,
        homeOwnership: undefined,
        source: 'Free Quote Form',
        coverageLabel: 'Home / Renters Insurance',
      }),
    )
    assert.equal(finalCta.status, 200)
  })

  it('requires a phone number', async () => {
    const response = await post(validLead({ phone: '' }))
    assert.equal(response.status, 422)
    assert.match((await responseJson(response)).error ?? '', /Phone number is required/)
  })

  it('rejects malformed contact and location values', async () => {
    for (const values of [
      { email: 'not-an-email' },
      { zip: '2820x' },
      { state: 'CA' },
      { homeOwnership: 'Maybe' },
    ]) {
      const response = await post(validLead(values))
      assert.equal(response.status, 422)
    }
  })

  it('rejects unknown products and altered Life classifications', async () => {
    for (const values of [
      { product: 'spaceship' },
      { source: 'Free Quote Form' },
      { coverageLabel: 'Business Insurance' },
    ]) {
      const response = await post(validLead(values))
      assert.equal(response.status, 422)
    }
  })

  it('rejects malformed JSON, non-object JSON, unknown fields, and wrong content types', async () => {
    const malformed = await post('{')
    assert.equal(malformed.status, 400)

    const array = await post([])
    assert.equal(array.status, 400)

    const unknownField = await post(validLead({ admin: true }))
    assert.equal(unknownField.status, 400)

    const wrongContentType = await post(validLead(), { contentType: 'text/plain' })
    assert.equal(wrongContentType.status, 415)
  })

  it('rejects oversized, script-like, and control-character input before delivery', async () => {
    const oversizedField = await post(validLead({ firstName: 'A'.repeat(81) }))
    assert.equal(oversizedField.status, 400)

    const oversizedBody = await post('x'.repeat(10 * 1024 + 1))
    assert.equal(oversizedBody.status, 413)

    const scriptInput = await post(validLead({ firstName: '<script>alert(1)</script>' }))
    assert.equal(scriptInput.status, 400)

    const controlCharacters = await post(validLead({ notes: 'Line one\r\nBcc: example@example.com' }))
    assert.equal(controlCharacters.status, 400)
  })

  it('rejects cross-origin browser requests', async () => {
    const response = await post(validLead(), { origin: 'https://attacker.example' })
    assert.equal(response.status, 403)
  })

  it('suppresses an accepted duplicate request id without a second delivery', async (t) => {
    let calls = 0
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => {
      calls += 1
      return new Response('Thank You', { status: 200 })
    }
    t.after(() => {
      globalThis.fetch = originalFetch
    })

    const lead = validLead()
    assert.equal((await post(lead)).status, 200)
    assert.equal((await post(lead)).status, 200)
    assert.equal(calls, 1)
  })

  it('limits rapid repeated attempts per warm instance', async (t) => {
    mockJotform(t, new Response('Thank You', { status: 200 }))
    const ip = '203.0.113.77'
    const statuses = []
    for (let index = 0; index < 6; index += 1) {
      statuses.push((await post(validLead(), { ip })).status)
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429])
  })

  it('never reports success when Jotform times out or returns an error', async (t) => {
    const originalFetch = globalThis.fetch
    t.after(() => {
      globalThis.fetch = originalFetch
    })

    globalThis.fetch = async () => {
      throw new DOMException('timed out', 'TimeoutError')
    }
    const timeout = await post(validLead())
    assert.equal(timeout.status, 502)
    assert.equal((await responseJson(timeout)).success, undefined)

    globalThis.fetch = async () => new Response('Service unavailable', { status: 503 })
    const unavailable = await post(validLead())
    assert.equal(unavailable.status, 502)
    assert.equal((await responseJson(unavailable)).success, undefined)
  })

  it('returns 405 and an explicit Allow header for unsupported methods', async () => {
    for (const response of [GET(), OPTIONS()]) {
      assert.equal(response.status, 405)
      assert.equal(response.headers.get('allow'), 'POST')
    }
  })
})
