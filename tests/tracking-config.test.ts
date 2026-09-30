import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { autoFunnel } from '@/funnels/auto'
import { commercialFunnel } from '@/funnels/commercial'
import { lifeFunnel } from '@/funnels/life'
import { funnelForPath, validateConfig, type ClientTrackingConfig } from '@/lib/caps-tracking/config'
import { mapToGa4 } from '@/lib/caps-tracking/ga4'

const config = JSON.parse(readFileSync(new URL('../lib/caps-tracking/jp-wilson.json', import.meta.url), 'utf8')) as ClientTrackingConfig

describe('JP tracking config', () => {
  it('is a valid CAPS client config for the GA4 property we ship', () => {
    assert.deepEqual(validateConfig(config), [])
    assert.equal(config.ga_measurement_id, 'G-837LY8SGTM')
    assert.equal(config.client_id, 'jp-wilson')
  })

  for (const [id, product] of [['auto', autoFunnel], ['life', lifeFunnel], ['commercial', commercialFunnel]] as const) {
    it(`${id} funnel config lists exactly the steps the product renders, in order`, () => {
      const configured = config.funnels.find((f) => f.id === id)
      assert.ok(configured, `funnel ${id} missing from config`)
      assert.deepEqual(configured.steps.map((s) => s.id), product.steps.map((s) => s.id))
      assert.equal(configured.version, product.version)
    })
  }

  it('routes map to the intended funnel (longest prefix)', () => {
    assert.equal(funnelForPath(config, '/auto-insurance/quote')?.id, 'auto')
    assert.equal(funnelForPath(config, '/life-insurance/quote')?.id, 'life')
    assert.equal(funnelForPath(config, '/business-insurance/quote')?.id, 'commercial')
  })

  it('GA4 mapping never forwards identifiers or free values', () => {
    const out = mapToGa4({
      event_id: 'e1', event_name: 'lead_success', event_version: 1, timestamp: Date.now(), client_id: 'jp-wilson', site_id: 'main',
      session_id: 's_1', anonymous_visitor_id: 'v_1', pathname: '/auto-insurance/quote', lead_id: 'l_1', funnel_id: 'auto',
      props: { reason: 'x' },
    })
    assert.deepEqual(out.map((e) => e.name), ['generate_lead'])
    const params = JSON.stringify(out[0]?.params)
    for (const banned of ['l_1', 's_1', 'v_1', 'pathname', 'props']) assert.ok(!params.includes(banned), banned)
  })
})
