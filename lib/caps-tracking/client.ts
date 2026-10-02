// VENDORED from @caps/tracking@084a2ae — do not edit here; change caps-tracking and re-run scripts-vendor.sh

import { AttributionStore, type StorageLike } from './attribution'
import { stepIndexOf, type ClientTrackingConfig, type FunnelConfig } from './config'
import { mapToGa4 } from './ga4'
import { LIMITS, validateEvent, type DeviceClass, type EventName, type TrackingEvent } from './schema'

export interface Env {
  now(): number
  random(): string
  storage: StorageLike
  sessionStorage: StorageLike
  location: { href: string; pathname: string }
  referrer: string
  send(url: string, body: string): void
  gtag?: (...a: unknown[]) => void
  vercelTrack?: (name: string, props?: Record<string, string | number | boolean>) => void
  deviceClass(): DeviceClass
  isBot(): boolean
}

export interface FunnelTracker {
  view(): void
  start(): void
  stepView(stepId: string): void
  stepComplete(stepId: string): void
  back(fromStepId: string): void
  abandon(): void
  complete(): void
}

export interface Tracker {
  pageView(): void
  ctaClick(ctaId: string, location: string): void
  phoneClick(location: string): void
  emailClick(location: string): void
  funnel(funnelId: string): FunnelTracker
  leadSubmit(funnelId?: string): string
  leadSuccess(leadId: string, funnelId?: string): void
  leadFailure(leadId: string, funnelId?: string, reason?: string): void
  flush(): void
  ids(): { visitor: string; session: string }
}

const SESSION_IDLE_MS = 30 * 60_000
const AUTO_FLUSH = 10
const ID_RE = /^[A-Za-z0-9_.:-]{1,64}$/

function read(storage: StorageLike, key: string): string | null {
  try { return storage.getItem(key) } catch { return null }
}

function write(storage: StorageLike, key: string, value: string): void {
  try { storage.setItem(key, value) } catch { /* private mode or full storage */ }
}

export function createTracker(config: ClientTrackingConfig, env: Env): Tracker {
  const attribution = new AttributionStore(env.storage, env.now, config.domains)
  attribution.capture(env.location.href, env.referrer)

  const newId = (prefix: string): string => `${prefix}${env.random()}`
  let visitor: string = read(env.storage, 'caps_vid') ?? ''
  if (!visitor || !ID_RE.test(visitor) || !visitor.startsWith('v_')) {
    visitor = newId('v_')
    write(env.storage, 'caps_vid', visitor)
  }
  let session = ''
  let lastActivity = NaN
  let referrerSent = false
  let lastPagePath: string | null = null // only CONSECUTIVE identical paths are suppressed (re-render / double effect)
  let lastPageSession = ''
  const seenStepViews = new Set<string>()
  const completedLeads = new Set<string>()
  const localStarts = new Set<string>()
  const localCompletes = new Set<string>()
  const queue: TrackingEvent[] = []

  function currentSession(now: number, activity: boolean): string {
    const oldSession = session
    const storedSession = read(env.sessionStorage, 'caps_sid')
    const storedLast = Number(read(env.sessionStorage, 'caps_last'))
    const validStored = !!storedSession && storedSession.startsWith('s_') && ID_RE.test(storedSession)
    const previous = Math.max(
      Number.isFinite(storedLast) && storedLast > 0 ? storedLast : -Infinity,
      Number.isFinite(lastActivity) ? lastActivity : -Infinity,
    )
    const expired = Number.isFinite(previous) && now - previous > SESSION_IDLE_MS
    if (validStored && !expired) session = storedSession
    else if (!session || expired) {
      session = newId('s_')
      write(env.sessionStorage, 'caps_sid', session)
    }
    if (session !== oldSession) referrerSent = false
    if (expired) {
      localStarts.clear()
      localCompletes.clear()
    }
    if (activity) {
      lastActivity = now
      write(env.sessionStorage, 'caps_last', String(now))
    }
    return session
  }

  currentSession(env.now(), true)

  function emit(name: EventName, extra: Partial<TrackingEvent> = {}): boolean {
    if (env.isBot()) return false
    const now = env.now()
    const sid = currentSession(now, true)
    const first = attribution.first()
    const last = attribution.last()
    const props: Record<string, string | number | boolean> = {}
    if (first?.source && first.source !== last?.source) props.first_source = first.source
    if (first?.medium && first.medium !== last?.medium) props.first_medium = first.medium
    if (first?.campaign && first.campaign !== last?.campaign) props.first_campaign = first.campaign
    const includeReferrer = read(env.sessionStorage, 'caps_ref_sid') !== sid && !referrerSent
    const candidate: TrackingEvent = {
      event_id: env.random(),
      event_name: name,
      event_version: 1,
      timestamp: now,
      client_id: config.client_id,
      site_id: config.site_id,
      session_id: sid,
      anonymous_visitor_id: visitor,
      pathname: env.location.pathname,
      landing_page: first?.landing_page ?? env.location.pathname,
      referrer: includeReferrer ? env.referrer : undefined,
      source: last?.source,
      medium: last?.medium,
      campaign: last?.campaign,
      campaign_id: last?.campaign_id,
      content: last?.content,
      term: last?.term,
      click_id_kinds: last?.click_id_kinds,
      hook_id: last?.hook_id,
      post_id: last?.post_id,
      content_id: last?.content_id,
      ad_id: last?.ad_id,
      platform: last?.platform,
      experiment_id: last?.experiment_id,
      variant_id: last?.variant_id,
      device: env.deviceClass(),
      props: Object.keys(props).length ? props : undefined,
      ...extra,
    }
    const result = validateEvent(candidate, now)
    if (!result.ok) return false
    queue.push(result.event)
    fanout(result.event)
    if (includeReferrer) {
      referrerSent = true
      write(env.sessionStorage, 'caps_ref_sid', sid)
    }
    if (queue.length >= AUTO_FLUSH) flush()
    return true
  }

  const VERCEL_EVENTS = ['cta_click', 'phone_click', 'email_click', 'funnel_start', 'funnel_complete', 'lead_success']
  /** GA4 + Vercel destinations fire at emit time (not at batch flush) so they never lag or get lost on unload. */
  function fanout(event: TrackingEvent): void {
    if (env.gtag) {
      for (const mapped of mapToGa4(event)) {
        try { env.gtag('event', mapped.name, mapped.params) } catch { /* destination is optional */ }
      }
    }
    if (env.vercelTrack && VERCEL_EVENTS.includes(event.event_name)) {
      const props: Record<string, string | number | boolean> = { client_id: event.client_id }
      if (event.funnel_id) props.funnel_id = event.funnel_id
      if (event.cta_id) props.cta_id = event.cta_id
      try { env.vercelTrack(event.event_name, props) } catch { /* destination is optional */ }
    }
  }

  function flush(): void {
    if (env.isBot()) { queue.length = 0; return }
    while (queue.length) {
      const batch = queue.slice(0, LIMITS.maxBatch)
      try { env.send(config.ingest_endpoint, JSON.stringify({ events: batch })) }
      catch { return }
      queue.splice(0, batch.length)
    }
  }

  function funnelFields(funnelId?: string): Partial<TrackingEvent> {
    const funnel = config.funnels.find((f) => f.id === funnelId)
    return funnel ? { funnel_id: funnel.id, funnel_version: funnel.version } : {}
  }

  function funnel(funnelId: string): FunnelTracker {
    const definition: FunnelConfig | undefined = config.funnels.find((f) => f.id === funnelId)
    if (!definition) throw new Error(`Unknown funnel: ${funnelId}`)
    const fields = { funnel_id: definition.id, funnel_version: definition.version }
    const stepFields = (stepId: string): Partial<TrackingEvent> | null => {
      const index = stepIndexOf(definition, stepId)
      return index < 0 ? null : { ...fields, funnel_step: stepId, funnel_step_index: index }
    }
    const sessionKey = (kind: 'fs' | 'fc'): string => `caps_${kind}_${funnelId}`
    const once = (kind: 'fs' | 'fc', name: EventName): void => {
      const sid = currentSession(env.now(), false)
      const local = kind === 'fs' ? localStarts : localCompletes
      if (read(env.sessionStorage, sessionKey(kind)) === sid || local.has(sid)) return
      if (emit(name, fields)) {
        local.add(sid)
        write(env.sessionStorage, sessionKey(kind), sid)
      }
    }
    const isStarted = (): boolean => {
      const sid = currentSession(env.now(), false)
      return read(env.sessionStorage, sessionKey('fs')) === sid || localStarts.has(sid)
    }
    const isComplete = (): boolean => {
      const sid = currentSession(env.now(), false)
      return read(env.sessionStorage, sessionKey('fc')) === sid || localCompletes.has(sid)
    }
    return {
      view: () => { emit('funnel_view', fields) },
      start: () => { once('fs', 'funnel_start') },
      stepView: (stepId) => {
        const step = stepFields(stepId)
        if (!step || seenStepViews.has(`${funnelId}:${stepId}`)) return
        if (emit('funnel_step_view', step)) seenStepViews.add(`${funnelId}:${stepId}`)
      },
      stepComplete: (stepId) => {
        const step = stepFields(stepId)
        if (step) emit('funnel_step_complete', step)
      },
      // Going back is navigation, not progress: it emits nothing (the destination step's own view is counted by
      // stepView when it renders). Kept in the API so UIs can call it without special-casing.
      back: () => undefined,
      // An abandon only means something if the visitor actually started this funnel in this session.
      abandon: () => { if (isStarted() && !isComplete()) emit('funnel_abandon', fields) },
      complete: () => { once('fc', 'funnel_complete') },
    }
  }

  return {
    pageView: () => {
      const path = env.location.pathname
      const sid = currentSession(env.now(), false)
      if (sid !== lastPageSession) { lastPagePath = null; lastPageSession = sid }
      if (path !== lastPagePath && emit('page_view')) lastPagePath = path
    },
    ctaClick: (ctaId, location) => { emit('cta_click', { cta_id: ctaId, cta_location: location }) },
    phoneClick: (location) => { emit('phone_click', { cta_location: location }) },
    emailClick: (location) => { emit('email_click', { cta_location: location }) },
    funnel,
    leadSubmit: (funnelId) => {
      const leadId = newId('l_')
      emit('lead_submit', { ...funnelFields(funnelId), lead_id: leadId })
      return leadId
    },
    leadSuccess: (leadId, funnelId) => {
      if (!completedLeads.has(leadId) && emit('lead_success', { ...funnelFields(funnelId), lead_id: leadId })) completedLeads.add(leadId)
    },
    leadFailure: (leadId, funnelId, reason) => {
      emit('lead_failure', { ...funnelFields(funnelId), lead_id: leadId, props: reason ? { reason: reason.slice(0, 60).replace(/[^a-z0-9_ -]/gi, '') } : undefined })
    },
    flush,
    ids: () => ({ visitor, session: currentSession(env.now(), false) }),
  }
}

export function attachLinkTracking(doc: { addEventListener(t: string, f: (e: any) => void): void }, tracker: Tracker): void {
  doc.addEventListener('click', (event: any) => {
    const target = event.target?.closest ? event.target : event.target?.parentElement
    if (!target?.closest) return
    const location = target.closest('[data-cta-location]')?.dataset?.ctaLocation || 'page'
    const link = target.closest('a[href]')
    const href: string = link?.getAttribute?.('href') ?? ''
    if (href.startsWith('tel:')) tracker.phoneClick(location)
    else if (href.startsWith('mailto:')) tracker.emailClick(location)
    else {
      const cta = target.closest('[data-cta-id]')
      if (cta?.dataset?.ctaId) tracker.ctaClick(cta.dataset.ctaId, cta.dataset.ctaLocation || location)
    }
  })
}
