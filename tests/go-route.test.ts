import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { GET, HEAD } from '@/app/go/[code]/route'
import robots from '@/app/robots'
import { parseTouch } from '@/lib/caps-tracking/attribution'
import { funnelForPath } from '@/lib/caps-tracking/config'
import { validateGoRegistry } from '@/lib/caps-tracking/go'
import { GO_CONFIG, GO_REGISTRY } from '@/lib/go/registry'

const call = (fn: typeof GET, path: string) => fn(new Request(`https://www.jpwilsonfinancial.com${path}`), { params: Promise.resolve({ code: path.split('?')[0].split('/')[2] }) })
const dest = (res: Response) => new URL(res.headers.get('location') as string, 'https://www.jpwilsonfinancial.com')

describe('/go/<code> route', () => {
  it('the shipped registry is valid for the shipped tracking config', () => {
    assert.deepEqual(validateGoRegistry(GO_REGISTRY, GO_CONFIG), [])
  })

  it('valid code: 302 to the Auto funnel, relative Location, never cached or indexed, no cookie', async () => {
    const res = await call(GET, '/go/chk-auto')
    assert.equal(res.status, 302)
    assert.match(res.headers.get('location') as string, /^\/auto-insurance\/quote\?/)
    assert.match(res.headers.get('cache-control') as string, /no-store/)
    assert.match(res.headers.get('x-robots-tag') as string, /noindex/)
    assert.equal(res.headers.get('set-cookie'), null)
    assert.equal(funnelForPath(GO_CONFIG, dest(res).pathname)?.id, 'auto')
  })

  it('the redirect carries the registered attribution and the REAL CAPS parser stores it', async () => {
    const res = await call(GET, '/go/chk-auto')
    const u = dest(res)
    assert.deepEqual(Object.fromEntries(u.searchParams), {
      utm_source: 'caps_go_check', utm_medium: 'test', utm_campaign: 'jp-go-check', utm_content: 'a',
      post_id: 'chk-001', exp: 'jp-go-check', variant: 'a', platform: 'web',
    })
    const touch = parseTouch(u.toString(), '', Date.now(), ['jpwilsonfinancial.com'])!
    assert.equal(touch.source, 'caps_go_check')
    assert.equal(touch.medium, 'test')
    assert.equal(touch.campaign, 'jp-go-check')
    assert.equal(touch.post_id, 'chk-001')
    assert.equal(touch.experiment_id, 'jp-go-check')
    assert.equal(touch.variant_id, 'a')
    assert.equal(touch.landing_page, '/auto-insurance/quote')
  })

  it('HEAD (link-preview probes) gets the same redirect as GET', async () => {
    const [g, h] = [await call(GET, '/go/chk-auto'), await call(HEAD, '/go/chk-auto')]
    assert.equal(h.status, 302)
    assert.equal(h.headers.get('location'), g.headers.get('location'))
  })

  for (const bad of ['/go/nope-1', '/go/x', '/go/%2e%2e', '/go/CHK-AUTO%00']) {
    it(`invalid/unknown code ${bad} falls back to "/" with no attribution`, async () => {
      const res = await call(GET, bad)
      assert.equal(res.status, 302)
      assert.equal(res.headers.get('location'), '/')
      assert.match(res.headers.get('cache-control') as string, /no-store/)
    })
  }

  it('inbound utm params cannot override the registry; click ids pass through', async () => {
    const res = await call(GET, '/go/chk-auto?utm_source=evil&post_id=hijack&fbclid=IwAR0test')
    const u = dest(res)
    assert.equal(u.searchParams.get('utm_source'), 'caps_go_check')
    assert.equal(u.searchParams.get('post_id'), 'chk-001')
    assert.equal(u.searchParams.get('fbclid'), 'IwAR0test')
  })

  it('does not inflate counts: no network, no tracker/analytics import, nothing emitted', async () => {
    const realFetch = globalThis.fetch
    let calls = 0
    globalThis.fetch = (async () => { calls++; throw new Error('redirect must not use the network') }) as typeof fetch
    try {
      await call(GET, '/go/chk-auto'); await call(HEAD, '/go/chk-auto'); await call(GET, '/go/nope-1')
    } finally {
      globalThis.fetch = realFetch
    }
    assert.equal(calls, 0)
    const src = readFileSync(new URL('../app/go/[code]/route.ts', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    for (const forbidden of [/caps-tracking\/client/, /tracker/, /@vercel\/analytics/, /@next\/third-parties/, /\bfetch\(/, /cookies\(/, /sendBeacon/, /ga4/i]) {
      assert.equal(forbidden.test(src), false, `route must not reference ${forbidden}`)
    }
  })

  it('robots.txt keeps well-behaved crawlers off /go/', () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules
    assert.ok(([] as string[]).concat(rules.disallow ?? []).includes('/go/'))
  })

  it('short link fits a 125-character Roomvu caption with room for copy', () => {
    assert.ok('https://www.jpwilsonfinancial.com/go/chk-auto'.length < 50)
  })
})
