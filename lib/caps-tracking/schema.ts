// VENDORED from @caps/tracking@cc4701d — do not edit here; change caps-tracking and re-run scripts-vendor.sh

/**
 * CAPS tracking event contract, version 1.
 *
 * Provider-neutral. GA4 / Vercel are destinations fed from this shape (see ga4.ts);
 * they are never the source of truth. Hand-rolled validation, zero dependencies, so
 * the same file runs in the browser, in a Next route and in tests.
 *
 * Privacy by construction: there is NO free-form payload. Every field is either an
 * enum, an opaque id, or a short bounded string that is scanned for PII shapes.
 * Sensitive form answers (SSN, DOB, licence, coverage answers) have nowhere to go.
 */

export const EVENT_VERSION = 1 as const

export const EVENT_NAMES = [
  'page_view',
  'cta_click',
  'phone_click',
  'email_click',
  'funnel_view',
  'funnel_start',
  'funnel_step_view',
  'funnel_step_complete',
  'funnel_abandon',
  'funnel_complete',
  'lead_submit',
  'lead_success',
  'lead_failure',
  'appointment_booked',
  'customer_won',
  'attribution_capture',
] as const
export type EventName = (typeof EVENT_NAMES)[number]

/** Events only a trusted server/back-office may send (downstream CRM truth). */
export const SERVER_ONLY_EVENTS: readonly EventName[] = ['appointment_booked', 'customer_won']

export const DEVICE_CLASSES = ['mobile', 'tablet', 'desktop', 'unknown'] as const
export type DeviceClass = (typeof DEVICE_CLASSES)[number]

export interface TrackingEvent {
  event_id: string
  event_name: EventName
  event_version: typeof EVENT_VERSION
  /** ms since epoch, client clock; the server also stamps received_at. */
  timestamp: number

  client_id: string
  site_id: string

  session_id: string
  anonymous_visitor_id: string

  pathname: string
  landing_page?: string
  referrer?: string

  funnel_id?: string
  funnel_version?: string
  funnel_step?: string
  /** 0-based position of funnel_step, for ordering drop-off without a registry lookup. */
  funnel_step_index?: number

  lead_id?: string

  cta_id?: string
  cta_location?: string

  source?: string
  medium?: string
  campaign?: string
  campaign_id?: string
  content?: string
  term?: string
  /** CAPS content-engine ids (same vocabulary as the ManyChat/audit-funnel chain). Opaque ids only. */
  hook_id?: string
  post_id?: string
  content_id?: string
  ad_id?: string
  platform?: string
  experiment_id?: string
  variant_id?: string
  /** Names of ad click ids seen (gclid, fbclid, ...). Values are NOT stored. */
  click_id_kinds?: string[]

  device?: DeviceClass

  /** Small allowlisted scalar bag: at most MAX_PROPS keys, see validateProps. */
  props?: Record<string, string | number | boolean>
}

export const LIMITS = {
  id: 64,
  short: 100,
  path: 200,
  url: 300,
  maxProps: 8,
  propKey: 32,
  propValue: 100,
  maxClickKinds: 6,
  maxBatch: 20,
  maxBodyBytes: 16_384,
} as const

const ID_RE = /^[A-Za-z0-9_.:-]{1,64}$/
const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/
/** Step ids mirror product question ids, which may be camelCase (e.g. homeOwnership). */
const STEP_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/
/** Marketing labels (utm_*): letters, digits, space and a few separators only. */
const MARKETING_TEXT_RE = /^[A-Za-z0-9\u00C0-\u024F _.:/+%|-]*$/
const PROP_KEY_RE = /^[a-z][a-z0-9_]{0,31}$/

/** String shapes that must never reach an analytics event. */
const PII_PATTERNS: readonly RegExp[] = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // email
  /(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/, // US phone
  /(?<!\d)\d{3}[ -]?\d{2}[ -]?\d{4}(?!\d)/, // SSN (spaces, dashes or none)
  /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/, // card-like digit run
  /(?<!\d)(?:19\d{2})[-/.]?(?:0[1-9]|1[0-2])[-/.]?(?:0[1-9]|[12]\d|3[01])(?!\d)/, // DOB-like ISO / compact (19xx)
  /(?<!\d)(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12]\d|3[01])[/-](?:19|20)\d{2}(?!\d)/, // DOB-like date
]

/** Digit-only values of 9+ digits (SSN/phone/account-like) are never a legitimate marketing id. */
export function looksLikeIdentifierPii(value: string): boolean {
  if (/^\d{9,}$/.test(value)) return true
  if (/@/.test(value)) return true
  // Whole-value personal shapes only: generated ids (UUIDs) legitimately contain digit runs.
  return /^(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value) || /^\d{3}[ -]\d{2}[ -]\d{4}$/.test(value) || /^19\d{2}[-/.]\d{2}[-/.]\d{2}$/.test(value)
}

export function looksLikePii(value: string): boolean {
  return PII_PATTERNS.some((re) => re.test(value))
}

/** Query-string / fragment keys that are safe to keep on a stored URL: none. Paths only. */
export function sanitizePath(input: string): string | null {
  let path = input
  try {
    path = new URL(input, 'https://placeholder.invalid').pathname
  } catch {
    return null
  }
  if (!path.startsWith('/')) return null
  path = path.slice(0, LIMITS.path)
  return looksLikePii(path) ? null : path
}

/** Keep origin + path of a referrer; drop query and fragment (they carry tokens / PII). */
export function sanitizeReferrer(input: string): string | null {
  try {
    const u = new URL(input)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    const out = `${u.origin}${u.pathname}`.slice(0, LIMITS.url)
    return looksLikePii(out) ? null : out
  } catch {
    return null
  }
}

export type ValidationResult =
  | { ok: true; event: TrackingEvent }
  | { ok: false; errors: string[] }

const ALLOWED_KEYS = new Set<string>([
  'event_id', 'event_name', 'event_version', 'timestamp', 'client_id', 'site_id',
  'session_id', 'anonymous_visitor_id', 'pathname', 'landing_page', 'referrer',
  'funnel_id', 'funnel_version', 'funnel_step', 'funnel_step_index', 'lead_id',
  'cta_id', 'cta_location', 'source', 'medium', 'campaign', 'campaign_id', 'content',
  'term', 'click_id_kinds', 'device', 'props', 'hook_id', 'post_id', 'content_id', 'ad_id',
  'platform', 'experiment_id', 'variant_id',
])

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Validate and normalise one event. Unknown keys are REJECTED (not silently dropped) so a
 * caller that tries to smuggle a form field in learns immediately and tests catch it.
 */
export function validateEvent(input: unknown, now: number = Date.now()): ValidationResult {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['event must be an object'] }

  for (const key of Object.keys(input)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`unknown field: ${key.slice(0, 40)}`)
  }

  const id = (name: string, required: boolean, re: RegExp = ID_RE): string | undefined => {
    const v = input[name]
    if (v === undefined || v === null || v === '') {
      if (required) errors.push(`${name} is required`)
      return undefined
    }
    if (typeof v !== 'string' || !re.test(v)) {
      errors.push(`${name} is malformed`)
      return undefined
    }
    return v
  }
  // Marketing ids that come from URLs/links: same shape rule plus a PII scan (a link must not smuggle personal data in).
  const freeId = (name: string): string | undefined => {
    const v = id(name, false)
    if (v !== undefined && looksLikeIdentifierPii(v)) {
      errors.push(`${name} looks like personal data`)
      return undefined
    }
    return v
  }
  const text = (name: string, max: number = LIMITS.short): string | undefined => {
    const v = input[name]
    if (v === undefined || v === null || v === '') return undefined
    if (typeof v !== 'string') {
      errors.push(`${name} must be a string`)
      return undefined
    }
    const trimmed = v.trim().slice(0, max)
    if (!MARKETING_TEXT_RE.test(trimmed)) {
      errors.push(`${name} has unsupported characters`)
      return undefined
    }
    if (looksLikePii(trimmed)) {
      errors.push(`${name} looks like personal data`)
      return undefined
    }
    return trimmed || undefined
  }

  const eventName = input.event_name
  if (typeof eventName !== 'string' || !(EVENT_NAMES as readonly string[]).includes(eventName)) {
    errors.push('event_name is not a known event')
  }
  if (input.event_version !== EVENT_VERSION) errors.push(`event_version must be ${EVENT_VERSION}`)

  const timestamp = input.timestamp
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    errors.push('timestamp must be a number')
  } else if (timestamp > now + 5 * 60_000 || timestamp < now - 7 * 24 * 3_600_000) {
    errors.push('timestamp outside accepted window')
  }

  const funnelStepIndex = input.funnel_step_index
  if (funnelStepIndex !== undefined && funnelStepIndex !== null) {
    if (typeof funnelStepIndex !== 'number' || !Number.isInteger(funnelStepIndex) || funnelStepIndex < 0 || funnelStepIndex > 99) {
      errors.push('funnel_step_index must be an integer 0-99')
    }
  }

  const pathRaw = input.pathname
  const pathname = typeof pathRaw === 'string' ? sanitizePath(pathRaw) : null
  if (!pathname) errors.push('pathname is required and must be a clean path')

  const landingRaw = input.landing_page
  const landing_page = typeof landingRaw === 'string' ? sanitizePath(landingRaw) ?? undefined : undefined
  if (landingRaw !== undefined && landingRaw !== null && landingRaw !== '' && !landing_page) errors.push('landing_page is malformed')

  const refRaw = input.referrer
  const referrer = typeof refRaw === 'string' && refRaw ? sanitizeReferrer(refRaw) ?? undefined : undefined

  const device = input.device
  if (device !== undefined && device !== null && !(DEVICE_CLASSES as readonly string[]).includes(device as string)) {
    errors.push('device is not a known class')
  }

  let click_id_kinds: string[] | undefined
  if (input.click_id_kinds !== undefined && input.click_id_kinds !== null) {
    const v = input.click_id_kinds
    if (!Array.isArray(v) || v.length > LIMITS.maxClickKinds || !v.every((k) => typeof k === 'string' && /^[a-z_]{1,16}$/.test(k))) {
      errors.push('click_id_kinds is malformed')
    } else click_id_kinds = v as string[]
  }

  const props = validateProps(input.props, errors)

  const event: TrackingEvent = {
    event_id: id('event_id', true) ?? '',
    event_name: eventName as EventName,
    event_version: EVENT_VERSION,
    timestamp: timestamp as number,
    client_id: id('client_id', true, SLUG_RE) ?? '',
    site_id: id('site_id', true, SLUG_RE) ?? '',
    session_id: id('session_id', true) ?? '',
    anonymous_visitor_id: id('anonymous_visitor_id', true) ?? '',
    pathname: pathname ?? '',
    landing_page,
    referrer,
    funnel_id: id('funnel_id', false, SLUG_RE),
    funnel_version: id('funnel_version', false),
    funnel_step: id('funnel_step', false, STEP_RE),
    funnel_step_index: typeof funnelStepIndex === 'number' ? funnelStepIndex : undefined,
    lead_id: freeId('lead_id'),
    cta_id: id('cta_id', false, SLUG_RE),
    cta_location: id('cta_location', false, SLUG_RE),
    source: text('source'),
    medium: text('medium'),
    campaign: text('campaign'),
    campaign_id: text('campaign_id'),
    content: text('content'),
    term: text('term'),
    hook_id: freeId('hook_id'),
    post_id: freeId('post_id'),
    content_id: freeId('content_id'),
    ad_id: freeId('ad_id'),
    platform: freeId('platform'),
    experiment_id: freeId('experiment_id'),
    variant_id: freeId('variant_id'),
    click_id_kinds,
    device: typeof device === 'string' ? (device as DeviceClass) : undefined,
    props,
  }

  if (errors.length) return { ok: false, errors }
  // Drop undefined keys so stored/serialised events are compact and comparable.
  for (const k of Object.keys(event) as (keyof TrackingEvent)[]) {
    if (event[k] === undefined) delete event[k]
  }
  return { ok: true, event }
}

function validateProps(raw: unknown, errors: string[]): Record<string, string | number | boolean> | undefined {
  if (raw === undefined || raw === null) return undefined
  if (!isRecord(raw)) {
    errors.push('props must be an object')
    return undefined
  }
  const keys = Object.keys(raw)
  if (keys.length > LIMITS.maxProps) {
    errors.push(`props has more than ${LIMITS.maxProps} keys`)
    return undefined
  }
  const out: Record<string, string | number | boolean> = {}
  for (const key of keys) {
    const v = raw[key]
    if (!PROP_KEY_RE.test(key)) {
      errors.push(`props key is malformed: ${key.slice(0, 20)}`)
      continue
    }
    if (typeof v === 'string') {
      if (v.length > LIMITS.propValue) errors.push(`props.${key} is too long`)
      else if (looksLikePii(v)) errors.push(`props.${key} looks like personal data`)
      else out[key] = v
    } else if (typeof v === 'number' && Number.isFinite(v)) out[key] = v
    else if (typeof v === 'boolean') out[key] = v
    else errors.push(`props.${key} must be a string, number or boolean`)
  }
  return Object.keys(out).length ? out : undefined
}

/** Deterministic sort key used when a store must order a funnel's steps. */
export function stepOrder(e: Pick<TrackingEvent, 'funnel_step_index'>): number {
  return e.funnel_step_index ?? Number.MAX_SAFE_INTEGER
}
