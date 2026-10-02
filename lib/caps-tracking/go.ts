// VENDORED from @caps/tracking@cc4701d — do not edit here; change caps-tracking and re-run scripts-vendor.sh

/**
 * /go/<code> short-link attribution (pure, zero-dependency; vendored into client sites).
 *
 * A client site mounts one route handler that calls resolveGoLink(). A registry maps a short code to a
 * destination PATH on the same site plus the attribution fields CAPS already understands. The redirect
 * itself records nothing: a real visit starts when the destination page loads and the tracker reads the
 * params (see attribution.ts parseTouch). Bots and link-preview crawlers may hit the redirect, so it must
 * never emit an event, set a cookie, or be cached.
 *
 * Fail-safe rules: an unknown, malformed, expired or invalid code returns the fallback path "/" with NO
 * attribution params. A destination is always a same-site path that belongs to a configured funnel (or "/"),
 * so this can never become an open redirect. Registry values are re-validated at resolve time as well as in
 * validateGoRegistry(), because a bad entry must not be able to inject params.
 */
import { CLICK_ID_KEYS } from './attribution'
import { funnelForPath, type ClientTrackingConfig } from './config'
import { looksLikeIdentifierPii } from './schema'

export interface GoLink {
  /** Short, lowercase, URL-safe. Appears in captions (Roomvu's caption field is 125 characters). */
  code: string
  /** Same-site path of a configured funnel route, e.g. /auto-insurance/quote (no query, no hash). */
  dest: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  /** utm_content; defaults to the variant when omitted. */
  utm_content?: string
  post_id?: string
  /** Experiment id (CAPS reads the `exp` param). */
  exp?: string
  variant?: string
  platform?: string
  hook_id?: string
  content_id?: string
  /** Last day (inclusive, UTC, YYYY-MM-DD) the link redirects with attribution. After that: fallback. */
  expires?: string
  /** Free note for humans (never sent anywhere). */
  note?: string
}

export interface GoRegistry {
  version: 1
  links: GoLink[]
}

export const GO_CODE_RE = /^[a-z0-9][a-z0-9-]{1,15}$/
const LABEL_RE = /^[a-z0-9][a-z0-9_.-]{0,31}$/ // utm_source / utm_medium / platform (CAPS lowercases source+medium)
const ID_RE = /^[A-Za-z0-9_.:-]{1,64}$/ // same alphabet CAPS accepts for ids
const PATH_RE = /^\/(?:[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)?$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const CLICK_ID_RE = /^[A-Za-z0-9_.~-]{1,256}$/

export const GO_FALLBACK_PATH = '/'

const FIELD_RULES: Array<[keyof GoLink, RegExp, boolean]> = [
  ['utm_source', LABEL_RE, true],
  ['utm_medium', LABEL_RE, true],
  ['utm_campaign', ID_RE, true],
  ['utm_content', ID_RE, false],
  ['post_id', ID_RE, false],
  ['exp', ID_RE, false],
  ['variant', ID_RE, false],
  ['platform', LABEL_RE, false],
  ['hook_id', ID_RE, false],
  ['content_id', ID_RE, false],
]

export function normalizeGoCode(raw: string): string | null {
  const code = (raw ?? '').trim().toLowerCase()
  return GO_CODE_RE.test(code) ? code : null
}

/** Problems with one link, [] when valid. `config` is used to prove dest belongs to a funnel route. */
export function validateGoLink(link: GoLink, config: ClientTrackingConfig): string[] {
  const errors: string[] = []
  const where = `link "${link?.code}"`
  if (!link || typeof link !== 'object') return ['link is not an object']
  if (typeof link.code !== 'string' || !GO_CODE_RE.test(link.code)) errors.push(`${where}: code must match ${GO_CODE_RE}`)
  if (typeof link.dest !== 'string' || !PATH_RE.test(link.dest)) errors.push(`${where}: dest must be a same-site path like /auto-insurance/quote`)
  else if (link.dest !== '/' && !funnelForPath(config, link.dest)) errors.push(`${where}: dest ${link.dest} is not inside a configured funnel route`)
  for (const [field, re, required] of FIELD_RULES) {
    const v = link[field]
    if (v === undefined || v === '') {
      if (required) errors.push(`${where}: ${field} is required`)
      continue
    }
    if (typeof v !== 'string' || !re.test(v)) errors.push(`${where}: ${field} "${String(v).slice(0, 40)}" has characters or length CAPS rejects`)
    else if (looksLikeIdentifierPii(v)) errors.push(`${where}: ${field} looks like a personal identifier`)
  }
  if (link.expires !== undefined && (!DATE_RE.test(link.expires) || Number.isNaN(Date.parse(`${link.expires}T00:00:00Z`)))) errors.push(`${where}: expires must be YYYY-MM-DD`)
  return errors
}

export function validateGoRegistry(registry: GoRegistry, config: ClientTrackingConfig): string[] {
  if (!registry || registry.version !== 1 || !Array.isArray(registry.links)) return ['registry must be { version: 1, links: [] }']
  const errors: string[] = []
  const seen = new Set<string>()
  for (const link of registry.links) {
    errors.push(...validateGoLink(link, config))
    if (typeof link?.code === 'string') {
      if (seen.has(link.code)) errors.push(`duplicate code "${link.code}"`)
      seen.add(link.code)
    }
  }
  return errors
}

export type GoResolution =
  | { kind: 'redirect'; location: string; link: GoLink }
  | { kind: 'fallback'; location: string; reason: 'invalid_code' | 'unknown_code' | 'expired' | 'invalid_link' }

/** Click ids platforms append to the short link (fbclid, gclid, ...). They are forwarded so CAPS still sees them. */
function passthroughClickIds(inbound: URLSearchParams | string | undefined): Array<[string, string]> {
  if (!inbound) return []
  const params = typeof inbound === 'string' ? new URLSearchParams(inbound) : inbound
  const out: Array<[string, string]> = []
  for (const key of CLICK_ID_KEYS) {
    const v = params.get(key)?.trim()
    if (v && CLICK_ID_RE.test(v)) out.push([key, v])
  }
  return out
}

/** The destination URL (path + query) for a link. Inbound utm_* / ids on the short link are ignored: the registry is the only source. */
export function buildGoDestination(link: GoLink, inbound?: URLSearchParams | string): string {
  const q = new URLSearchParams()
  q.set('utm_source', link.utm_source)
  q.set('utm_medium', link.utm_medium)
  q.set('utm_campaign', link.utm_campaign)
  const content = link.utm_content ?? link.variant
  if (content) q.set('utm_content', content)
  for (const field of ['post_id', 'exp', 'variant', 'platform', 'hook_id', 'content_id'] as const) {
    const v = link[field]
    if (v) q.set(field, v)
  }
  for (const [k, v] of passthroughClickIds(inbound)) q.set(k, v)
  return `${link.dest}?${q.toString()}`
}

export function resolveGoLink(
  registry: GoRegistry,
  config: ClientTrackingConfig,
  rawCode: string,
  inbound?: URLSearchParams | string,
  now: number = Date.now(),
): GoResolution {
  const code = normalizeGoCode(rawCode)
  if (!code) return { kind: 'fallback', location: GO_FALLBACK_PATH, reason: 'invalid_code' }
  const link = registry?.links?.find((l) => l?.code === code)
  if (!link) return { kind: 'fallback', location: GO_FALLBACK_PATH, reason: 'unknown_code' }
  if (validateGoLink(link, config).length > 0) return { kind: 'fallback', location: GO_FALLBACK_PATH, reason: 'invalid_link' }
  if (link.expires && now > Date.parse(`${link.expires}T23:59:59.999Z`)) return { kind: 'fallback', location: GO_FALLBACK_PATH, reason: 'expired' }
  return { kind: 'redirect', location: buildGoDestination(link, inbound), link }
}

/** Response headers every /go response must carry: never cached, never indexed, no cookies. */
export const GO_RESPONSE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
})

export function goShortUrl(origin: string, code: string): string {
  return `${origin.replace(/\/$/, '')}/go/${code}`
}
