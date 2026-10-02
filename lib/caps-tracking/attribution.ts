// VENDORED from @caps/tracking@cc4701d — do not edit here; change caps-tracking and re-run scripts-vendor.sh

/**
 * Durable first-touch + last-touch attribution.
 *
 * Why it lives here and not in the event: a visitor arrives on a landing page with
 * UTMs (or an ad click id, or an external referrer) and then walks through a
 * multi-step form where the final page carries NO utm and NO referrer. If a session
 * only ever reported the URL it happened to be on, every touch would be lost. So the
 * touch is captured once, into storage, and read back at submit time.
 *
 * Rules that keep this honest:
 *   - click id VALUES are never stored, only the kind (see CLICK_ID_KEYS / schema.ts).
 *   - a touch is only a touch if it actually carries signal: utm, a click id, or an
 *     external referrer. Internal navigation (own host) and direct entry are not new
 *     touches; direct traffic is represented by the ABSENCE of a first touch.
 *   - queries and fragments are stripped everywhere: they carry tokens and PII.
 *   - first-touch never moves once set (it is the whole point), except after 90 days
 *     where the visitor is treated as new again.
 */

import { LIMITS, looksLikeIdentifierPii } from './schema'

export interface StorageLike {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export interface Touch {
  source?: string
  medium?: string
  campaign?: string
  campaign_id?: string
  content?: string
  term?: string
  hook_id?: string
  post_id?: string
  content_id?: string
  ad_id?: string
  platform?: string
  experiment_id?: string
  variant_id?: string
  click_id_kinds?: string[]
  landing_page: string
  referrer?: string
  ts: number
}

/**
 * Ad click ids we recognise. The array position is irrelevant; the *name* is the
 * stored kind and it always equals the parameter key (schema.ts validates kinds as
 * /^[a-z_]{1,16}$/, so no key that does not match that shape is listed here).
 */
export const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id'] as const

/** Storage keys. first is written once; last is overwritten by every touch. */
export const FIRST_KEY = 'caps_attr_first'
export const LAST_KEY = 'caps_attr_last'

/** A first touch older than this is no longer that visitor's first touch. */
export const FIRST_TOUCH_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

/** search engines are recognised by substring, per spec. */
const ORGANIC_HOST_HINTS = ['google.', 'bing.', 'duckduckgo.', 'yahoo.']

const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/** utm/campaign values are bounded by the same LIMITS.short the event contract uses. */
function text(value: string | null, lower: boolean): string | undefined {
  if (value === null) return undefined
  const trimmed = value.trim().slice(0, LIMITS.short)
  if (!trimmed) return undefined
  const out = lower ? trimmed.toLowerCase() : trimmed
  return out || undefined
}

function parseUrl(input: string, base?: string): URL | null {
  try {
    return new URL(input, base)
  } catch {
    return null
  }
}

/** Origin + pathname only; http(s) only; query/fragment dropped. null when unusable. */
function cleanReferrer(input: string): { host: string; value: string } | null {
  const u = parseUrl(input)
  if (!u) return null
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  if (!u.hostname) return null
  return { host: u.hostname.toLowerCase(), value: `${u.origin}${u.pathname}` }
}

/** 'www.' is equivalent in both directions, so ownHosts may be written either way. */
function isOwnHost(host: string, ownHosts: string[]): boolean {
  const bare = host.replace(/^www\./, '')
  return ownHosts.some((h) => {
    const own = h.trim().toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '')
    return !!own && own === bare
  })
}

/**
 * Build a Touch from the current URL + referrer, or null when this page view
 * carries no new touch signal (internal navigation or a direct entry).
 */
export function parseTouch(url: string, referrer: string, now: number, ownHosts: string[]): Touch | null {
  const page = parseUrl(url)
  if (!page) return null

  const params = page.searchParams
  const utm = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
  const hasUtm = UTM_FIELDS.some((f) => utm[f] !== null)

  const click_id_kinds = CLICK_ID_KEYS.filter((key) => {
    const v = params.get(key)
    return v !== null && v.trim() !== ''
  })

  const ref = cleanReferrer(referrer ?? '')
  const refHost = ref ? ref.host : ''
  const ownRef = ref !== null && isOwnHost(refHost, ownHosts)
  const externalRef = ref !== null && !ownRef ? ref : null

  // CAPS content-engine ids count as a touch on their own (a ManyChat/audit link carries no utm).
  const SAFE_ID = /^[A-Za-z0-9_.:-]{1,64}$/
  const contentIds: Partial<Record<'hook_id' | 'post_id' | 'content_id' | 'ad_id' | 'platform' | 'experiment_id' | 'variant_id', string>> = {}
  for (const [field, param] of [['hook_id', 'hook_id'], ['post_id', 'post_id'], ['content_id', 'content_id'], ['ad_id', 'ad_id'], ['platform', 'platform'], ['experiment_id', 'exp'], ['variant_id', 'variant']] as const) {
    const v = params.get(param)?.trim()
    if (v && SAFE_ID.test(v) && !looksLikeIdentifierPii(v)) contentIds[field] = v
  }
  const hasContentIds = Object.keys(contentIds).length > 0

  const hasSignal = hasUtm || click_id_kinds.length > 0 || externalRef !== null || hasContentIds
  if (!hasSignal) return null

  const touch: Touch = {
    landing_page: page.pathname.slice(0, LIMITS.path) || '/',
    ts: now,
  }

  if (hasUtm) {
    const source = text(utm.utm_source, true)
    const medium = text(utm.utm_medium, true)
    if (source !== undefined) touch.source = source
    if (medium !== undefined) touch.medium = medium
    const campaign = text(utm.utm_campaign, false)
    if (campaign !== undefined) touch.campaign = campaign
    const content = text(utm.utm_content, false)
    if (content !== undefined) touch.content = content
    const term = text(utm.utm_term, false)
    if (term !== undefined) touch.term = term
  } else if (externalRef) {
    // No utm: an external referrer is the only source of truth for this touch.
    touch.source = refHost
    const organic = ORGANIC_HOST_HINTS.some((hint) => refHost.includes(hint))
    touch.medium = organic ? 'organic' : 'referral'
  }

  // utm_id is the Google Ads id; some tools send campaign_id instead.
  const campaign_id = text(params.get('utm_id') ?? params.get('campaign_id'), false)
  if (campaign_id !== undefined) touch.campaign_id = campaign_id

  Object.assign(touch, contentIds)
  if (click_id_kinds.length) touch.click_id_kinds = [...click_id_kinds]
  if (externalRef) touch.referrer = externalRef.value

  return touch
}

/**
 * Two touches in `storage`, updated on every page view:
 *   - first: written once and never overwritten until FIRST_TOUCH_MAX_AGE_MS old.
 *   - last:  overwritten by every touch.
 * Both are defensive: a corrupt value or a storage that throws is treated as "no
 * touch yet", never as an error. Analytics must not break the form.
 */
export class AttributionStore {
  private readonly storage: StorageLike
  private readonly now: () => number
  private readonly ownHosts: string[]

  constructor(storage: StorageLike, now: () => number, ownHosts: string[]) {
    this.storage = storage
    this.now = now
    this.ownHosts = ownHosts
  }

  capture(url: string, referrer: string): void {
    const touch = parseTouch(url, referrer, this.now(), this.ownHosts)
    if (touch === null) return

    const first = this.read(FIRST_KEY)
    const freshFirst = first !== null && this.now() - first.ts <= FIRST_TOUCH_MAX_AGE_MS
    if (!freshFirst) this.write(FIRST_KEY, touch)
    this.write(LAST_KEY, touch)
  }

  first(): Touch | null {
    return this.read(FIRST_KEY)
  }

  last(): Touch | null {
    return this.read(LAST_KEY)
  }

  private read(key: string): Touch | null {
    let raw: string | null
    try {
      raw = this.storage.getItem(key)
    } catch {
      return null
    }
    if (!raw) return null
    try {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
      const value = parsed as Record<string, unknown>
      if (typeof value.ts !== 'number' || !Number.isFinite(value.ts)) return null
      if (typeof value.landing_page !== 'string') return null
      return parsed as Touch
    } catch {
      return null
    }
  }

  private write(key: string, touch: Touch): void {
    try {
      this.storage.setItem(key, JSON.stringify(touch))
    } catch {
      // quota / private mode / disabled storage: attribution degrades, page does not.
    }
  }
}