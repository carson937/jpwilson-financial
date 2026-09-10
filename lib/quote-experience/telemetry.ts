import type { LeadPayload } from '@/lib/leadValidation'

export const FUNNEL_IDS = ['auto', 'life', 'commercial'] as const
export const FUNNEL_BROWSER_EVENTS = ['funnel_view', 'funnel_start', 'step_view', 'step_answer', 'step_dropoff', 'contact_capture', 'submit_attempt', 'booking_click'] as const
export const FUNNEL_SERVER_EVENTS = ['submit_success', 'submit_failure', 'agencyzoom_handoff_started', 'agencyzoom_handoff_success', 'agencyzoom_handoff_failure'] as const
export const TRAFFIC_SOURCES = ['direct', 'google', 'meta', 'referral', 'other'] as const
export const AUTO_STEPS = ['insured', 'location', 'timing', 'vehicles', 'driving', 'contact', 'preferences'] as const
const FUNNEL_STEPS: Record<(typeof FUNNEL_IDS)[number], readonly string[]> = {
  auto: AUTO_STEPS,
  life: ['fullName', 'state', 'zip', 'homeOwnership', 'contact'],
  commercial: ['coverageNeed', 'industry', 'employeeRange', 'businessName', 'state', 'zip', 'fullName', 'contact'],
}
export type FunnelEvent = (typeof FUNNEL_BROWSER_EVENTS)[number] | (typeof FUNNEL_SERVER_EVENTS)[number]
export type TrafficSource = (typeof TRAFFIC_SOURCES)[number]
export type FunnelTelemetry = {
  eventId: string
  sessionId: string
  event: FunnelEvent
  source: TrafficSource
  funnelId: (typeof FUNNEL_IDS)[number]
  funnelVersion: string
  occurredAt: string
  step?: string
  requestId?: string
  acceptedVia?: 'agencyzoom' | 'agencyzoom_dry_run' | 'jotform' | 'fallback'
  agencyZoomLeadId?: number
}
export type AutoTelemetry = FunnelTelemetry
export type AutoSource = TrafficSource
export const AUTO_SOURCES = TRAFFIC_SOURCES
export const AUTO_BROWSER_EVENTS = FUNNEL_BROWSER_EVENTS
export const AUTO_SERVER_EVENTS = FUNNEL_SERVER_EVENTS
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SAFE_ID = /^[a-zA-Z0-9._:-]{1,160}$/

export function parseBrowserEvent(raw: unknown): FunnelTelemetry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const data = raw as Record<string, unknown>
  const allowed = ['eventId', 'sessionId', 'event', 'source', 'funnelId', 'funnelVersion', 'occurredAt', 'step', 'requestId']
  if (Object.keys(data).some((key) => !allowed.includes(key))) return null
  if (typeof data.eventId !== 'string' || !UUID.test(data.eventId) || typeof data.sessionId !== 'string' || !UUID.test(data.sessionId)) return null
  if (!(FUNNEL_BROWSER_EVENTS as readonly unknown[]).includes(data.event) || !(TRAFFIC_SOURCES as readonly unknown[]).includes(data.source)) return null
  if (!(FUNNEL_IDS as readonly unknown[]).includes(data.funnelId) || typeof data.funnelVersion !== 'string' || !SAFE_ID.test(data.funnelVersion)) return null
  if (typeof data.occurredAt !== 'string' || !Number.isFinite(Date.parse(data.occurredAt)) || Math.abs(Date.now() - Date.parse(data.occurredAt)) > 300_000) return null
  if (data.step !== undefined && (typeof data.step !== 'string' || !FUNNEL_STEPS[data.funnelId as FunnelTelemetry['funnelId']].includes(data.step))) return null
  if (['step_view', 'step_answer', 'step_dropoff', 'contact_capture'].includes(String(data.event)) && data.step === undefined) return null
  if (data.requestId !== undefined && (typeof data.requestId !== 'string' || !UUID.test(data.requestId))) return null
  return data as FunnelTelemetry
}

export function sourceBucket(search: string, referrer: string): TrafficSource {
  const params = new URLSearchParams(search)
  const source = (params.get('utm_source') ?? '').toLowerCase()
  if (['google', 'google_ads'].includes(source)) return 'google'
  if (['facebook', 'instagram', 'meta', 'fb', 'ig'].includes(source)) return 'meta'
  if (source) return 'other'
  if (!referrer) return 'direct'
  try {
    const host = new URL(referrer).hostname
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return 'google'
    if (/(^|\.)(facebook|instagram)\.com$/.test(host)) return 'meta'
    if (/(^|\.)jpwilsonfinancial\.com$/.test(host)) return 'direct'
    return 'referral'
  } catch { return 'direct' }
}

const safeParam = (params: URLSearchParams, key: string) => {
  const value = params.get(key)?.trim() ?? ''
  return SAFE_ID.test(value) ? value : ''
}

export function captureAttribution(search: string, referrer: string): Partial<LeadPayload> {
  const params = new URLSearchParams(search)
  let referralHost = ''
  try { referralHost = referrer ? new URL(referrer).hostname.slice(0, 160) : '' } catch { referralHost = '' }
  return {
    trafficSource: sourceBucket(search, referrer), platform: safeParam(params, 'platform'),
    campaignId: safeParam(params, 'campaign_id'), contentId: safeParam(params, 'content_id'),
    adId: safeParam(params, 'ad_id'), batchId: safeParam(params, 'batch_id'),
    utmSource: safeParam(params, 'utm_source'), utmMedium: safeParam(params, 'utm_medium'),
    utmCampaign: safeParam(params, 'utm_campaign'), utmContent: safeParam(params, 'utm_content'),
    utmTerm: safeParam(params, 'utm_term'), referralSource: safeParam(params, 'ref'), referralHost,
  }
}

export function sendFunnelEvent(event: FunnelTelemetry) {
  void fetch('/api/funnel-events', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event), keepalive: true, signal: AbortSignal.timeout(5000) }).catch(() => undefined)
}
export const sendAutoEvent = sendFunnelEvent
