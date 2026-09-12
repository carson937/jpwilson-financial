import type { LeadPayload } from '@/lib/leadValidation'

export const FUNNEL_IDS = ['auto', 'life', 'commercial'] as const
/**
 * `step_back` and `validation_error` were added alongside the Hub work that
 * finally gives this stream a receiver (see feat/jp-funnel-telemetry). Both
 * carry only a step id, exactly like step_view/step_answer/step_dropoff —
 * never the error text or the value that failed, so there is still no field
 * an answer or a validation message could occupy.
 */
export const FUNNEL_BROWSER_EVENTS = ['funnel_view', 'funnel_start', 'step_view', 'step_answer', 'step_dropoff', 'step_back', 'validation_error', 'contact_capture', 'submit_attempt', 'booking_click'] as const
export const FUNNEL_SERVER_EVENTS = ['submit_success', 'submit_failure', 'agencyzoom_handoff_started', 'agencyzoom_handoff_success', 'agencyzoom_handoff_failure'] as const
export const TRAFFIC_SOURCES = ['direct', 'google', 'meta', 'referral', 'other'] as const
export const DEVICE_CLASSES = ['mobile', 'desktop'] as const
export type DeviceClass = (typeof DEVICE_CLASSES)[number]
export const AUTO_STEPS = ['insured', 'location', 'timing', 'vehicles', 'driving', 'contact', 'preferences'] as const
const FUNNEL_STEPS: Record<(typeof FUNNEL_IDS)[number], readonly string[]> = {
  auto: AUTO_STEPS,
  life: ['fullName', 'state', 'zip', 'homeOwnership', 'contact'],
  commercial: ['industry', 'coverageNeed', 'zip', 'employeeRange', 'currentCoverage', 'insuranceStatus', 'claims', 'businessName', 'contact', 'recap'],
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
  /** Coarse only — a CSS-breakpoint class, never a User-Agent string. */
  device?: DeviceClass
  /** Set only when a URL carries ?exp=/&variant=. No experiment is active on
   * any funnel today, so this is plumbing ahead of use, not a live A/B test —
   * the Hub UI must show "no active experiment" rather than invent one when
   * these are absent, which they always are right now. */
  experimentId?: string
  variantId?: string
  /** CAPS content attribution — same vocabulary as the content-engine's
   * ManyChat/audit-funnel chain (?hook_id=/&post_id=), independent of the
   * LeadPayload/CRM path: these identify which piece of content drove the
   * visit, never anything about the visitor. */
  hookId?: string
  postId?: string
  campaignId?: string
  contentId?: string
  platform?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
export type AutoTelemetry = FunnelTelemetry
export type AutoSource = TrafficSource
export const AUTO_SOURCES = TRAFFIC_SOURCES
export const AUTO_BROWSER_EVENTS = FUNNEL_BROWSER_EVENTS
export const AUTO_SERVER_EVENTS = FUNNEL_SERVER_EVENTS
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SAFE_ID = /^[a-zA-Z0-9._:-]{1,160}$/

const optionalSafeId = (value: unknown) => value === undefined || (typeof value === 'string' && SAFE_ID.test(value))

export function parseBrowserEvent(raw: unknown): FunnelTelemetry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const data = raw as Record<string, unknown>
  const allowed = [
    'eventId', 'sessionId', 'event', 'source', 'funnelId', 'funnelVersion', 'occurredAt', 'step', 'requestId',
    'device', 'experimentId', 'variantId', 'hookId', 'postId', 'campaignId', 'contentId', 'platform', 'utmSource', 'utmMedium', 'utmCampaign',
  ]
  if (Object.keys(data).some((key) => !allowed.includes(key))) return null
  if (typeof data.eventId !== 'string' || !UUID.test(data.eventId) || typeof data.sessionId !== 'string' || !UUID.test(data.sessionId)) return null
  if (!(FUNNEL_BROWSER_EVENTS as readonly unknown[]).includes(data.event) || !(TRAFFIC_SOURCES as readonly unknown[]).includes(data.source)) return null
  if (!(FUNNEL_IDS as readonly unknown[]).includes(data.funnelId) || typeof data.funnelVersion !== 'string' || !SAFE_ID.test(data.funnelVersion)) return null
  if (typeof data.occurredAt !== 'string' || !Number.isFinite(Date.parse(data.occurredAt)) || Math.abs(Date.now() - Date.parse(data.occurredAt)) > 300_000) return null
  if (data.step !== undefined && (typeof data.step !== 'string' || !FUNNEL_STEPS[data.funnelId as FunnelTelemetry['funnelId']].includes(data.step))) return null
  if (['step_view', 'step_answer', 'step_dropoff', 'step_back', 'validation_error', 'contact_capture'].includes(String(data.event)) && data.step === undefined) return null
  if (data.requestId !== undefined && (typeof data.requestId !== 'string' || !UUID.test(data.requestId))) return null
  if (data.device !== undefined && !(DEVICE_CLASSES as readonly unknown[]).includes(data.device)) return null
  if (!optionalSafeId(data.experimentId) || !optionalSafeId(data.variantId) || !optionalSafeId(data.hookId) || !optionalSafeId(data.postId)
    || !optionalSafeId(data.campaignId) || !optionalSafeId(data.contentId) || !optionalSafeId(data.platform)
    || !optionalSafeId(data.utmSource) || !optionalSafeId(data.utmMedium) || !optionalSafeId(data.utmCampaign)) return null
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

/**
 * The subset of attribution + experiment/content identifiers that ride along
 * on every funnel EVENT (not the eventual lead/CRM payload — captureAttribution
 * above still owns that, unchanged). Kept as a separate, smaller function
 * rather than widening captureAttribution's return, so a future CRM field
 * never accidentally gains an analytics-only value like hookId/postId, and
 * vice versa.
 */
export function captureEventAttribution(search: string): Pick<FunnelTelemetry, 'experimentId' | 'variantId' | 'hookId' | 'postId' | 'campaignId' | 'contentId' | 'platform' | 'utmSource' | 'utmMedium' | 'utmCampaign'> {
  const params = new URLSearchParams(search)
  const pick = (key: string) => safeParam(params, key) || undefined
  return {
    experimentId: pick('exp'), variantId: pick('variant'),
    hookId: pick('hook_id'), postId: pick('post_id'),
    campaignId: pick('campaign_id'), contentId: pick('content_id'), platform: pick('platform'),
    utmSource: pick('utm_source'), utmMedium: pick('utm_medium'), utmCampaign: pick('utm_campaign'),
  }
}

/** Coarse device class from the same breakpoint the funnel's own responsive
 * layout uses (sm: 640px) — never a User-Agent string, never screen size in
 * pixels, just which side of the layout's own breakpoint the visitor is on. */
export function detectDeviceClass(): DeviceClass {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop'
  return window.matchMedia('(max-width: 640px)').matches ? 'mobile' : 'desktop'
}

export function sendFunnelEvent(event: FunnelTelemetry) {
  void fetch('/api/funnel-events', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event), keepalive: true, signal: AbortSignal.timeout(5000) }).catch(() => undefined)
}
export const sendAutoEvent = sendFunnelEvent
