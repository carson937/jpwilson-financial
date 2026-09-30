import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { captureEventAttribution, parseBrowserEvent } from '@/lib/quote-experience/telemetry'

const base = {
  eventId: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222',
  source: 'meta' as const,
  funnelId: 'commercial' as const,
  funnelVersion: '5.0.0',
  occurredAt: new Date().toISOString(),
}

describe('funnel telemetry — step_back / validation_error', () => {
  it('accepts step_back and validation_error with a step id', () => {
    assert.ok(parseBrowserEvent({ ...base, event: 'step_back', step: 'industry' }))
    assert.ok(parseBrowserEvent({ ...base, event: 'validation_error', step: 'zip' }))
  })
  it('rejects step_back/validation_error missing the required step', () => {
    assert.equal(parseBrowserEvent({ ...base, event: 'step_back' }), null)
    assert.equal(parseBrowserEvent({ ...base, event: 'validation_error' }), null)
  })
})

describe('funnel telemetry — device/experiment/content fields', () => {
  it('accepts a well-formed device class and experiment/variant/content ids', () => {
    const parsed = parseBrowserEvent({
      ...base, event: 'funnel_view', device: 'mobile', experimentId: 'exp-hero-v2', variantId: 'b',
      hookId: 'hook-9', postId: 'post-3', campaignId: 'camp-1', contentId: 'content-2', platform: 'instagram',
      utmSource: 'meta', utmMedium: 'paid-social', utmCampaign: 'fall-push',
    })
    assert.ok(parsed)
    assert.equal(parsed?.device, 'mobile')
    assert.equal(parsed?.experimentId, 'exp-hero-v2')
  })
  it('rejects an invalid device class', () => {
    assert.equal(parseBrowserEvent({ ...base, event: 'funnel_view', device: 'tablet' }), null)
  })
  it('rejects an unlisted field entirely — no path for a name/phone/email to ride along', () => {
    assert.equal(parseBrowserEvent({ ...base, event: 'funnel_view', fullName: 'Jane Public' }), null)
    assert.equal(parseBrowserEvent({ ...base, event: 'funnel_view', phone: '7045550142' }), null)
  })
  it('rejects an attribution field that is not a safe id (no free text)', () => {
    assert.equal(parseBrowserEvent({ ...base, event: 'funnel_view', contentId: 'has spaces and stuff' }), null)
  })
})

describe('captureEventAttribution', () => {
  it('reads exp/variant/hook_id/post_id from the query string', () => {
    const result = captureEventAttribution('?exp=hero-v2&variant=b&hook_id=hook-9&post_id=post-3&utm_source=meta')
    assert.equal(result.experimentId, 'hero-v2')
    assert.equal(result.variantId, 'b')
    assert.equal(result.hookId, 'hook-9')
    assert.equal(result.postId, 'post-3')
    assert.equal(result.utmSource, 'meta')
  })
  it('returns undefined fields (not empty strings) when nothing is present — no fabricated experiment', () => {
    const result = captureEventAttribution('')
    assert.equal(result.experimentId, undefined)
    assert.equal(result.variantId, undefined)
  })
})
