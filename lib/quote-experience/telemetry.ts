/** First-party operational measurement. Answers and arbitrary campaign strings are forbidden. */
export const AUTO_STEPS = ['insured', 'location', 'timing', 'vehicles', 'driving', 'contact', 'preferences'] as const
export const AUTO_BROWSER_EVENTS = ['funnel_view', 'funnel_start', 'step_view', 'step_complete', 'funnel_exit', 'submit_attempt', 'booking_click'] as const
export const AUTO_SERVER_EVENTS = ['submission_accepted', 'submission_failed'] as const
export const AUTO_SOURCES = ['direct', 'google', 'meta', 'referral', 'other'] as const
export type AutoEvent = (typeof AUTO_BROWSER_EVENTS)[number] | (typeof AUTO_SERVER_EVENTS)[number]
export type AutoSource = (typeof AUTO_SOURCES)[number]
export type AutoTelemetry = {
  eventId: string; sessionId: string; event: AutoEvent; source: AutoSource; occurredAt: string
  step?: (typeof AUTO_STEPS)[number]; requestId?: string; acceptedVia?: 'jotform' | 'fallback'
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseBrowserEvent(raw: unknown): AutoTelemetry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const data = raw as Record<string, unknown>
  if (Object.keys(data).some((key) => !['eventId', 'sessionId', 'event', 'source', 'occurredAt', 'step', 'requestId'].includes(key))) return null
  if (typeof data.eventId !== 'string' || !UUID.test(data.eventId) || typeof data.sessionId !== 'string' || !UUID.test(data.sessionId)) return null
  if (!(AUTO_BROWSER_EVENTS as readonly unknown[]).includes(data.event) || !(AUTO_SOURCES as readonly unknown[]).includes(data.source)) return null
  if (typeof data.occurredAt !== 'string' || !Number.isFinite(Date.parse(data.occurredAt)) || Math.abs(Date.now() - Date.parse(data.occurredAt)) > 300_000) return null
  if (data.step !== undefined && !(AUTO_STEPS as readonly unknown[]).includes(data.step)) return null
  if (['step_view', 'step_complete', 'funnel_exit'].includes(String(data.event)) && data.step === undefined) return null
  if (data.requestId !== undefined && (typeof data.requestId !== 'string' || !UUID.test(data.requestId))) return null
  return data as AutoTelemetry
}

/** Buckets only, never persist URL, referrer, gclid/fbclid, UTM content or visitor identifiers. */
export function sourceBucket(search: string, referrer: string): AutoSource {
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

export function sendAutoEvent(event: AutoTelemetry) {
  // Same-origin only. Telemetry must never hold up the question flow or trigger a resubmit.
  void fetch('/api/auto-events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event), keepalive: true, signal: AbortSignal.timeout(5000),
  }).catch(() => undefined)
}
