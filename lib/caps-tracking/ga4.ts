// VENDORED from @caps/tracking@922d2fa — do not edit here; change caps-tracking and re-run scripts-vendor.sh

/**
 * CAPS -> GA4 mapping. One place decides what leaves the building, so standard GA4
 * reports, funnels and key events work for every client without per-client listeners.
 *
 * GA4 is a destination, never the source of truth (see schema.ts). Privacy by
 * construction: it receives dimensions only. Identifiers (lead_id, session_id,
 * anonymous_visitor_id) and free values (referrer, landing_page, pathname, props) are
 * dropped here rather than at each call site, so there is exactly one boundary to audit.
 */
import type { EventName, TrackingEvent } from './schema'

export interface Ga4Event {
  name: string
  params: Record<string, string | number | boolean>
}

/**
 * Events a client should mark as GA4 key events. Documentation only: GA4 stores the
 * key-event flag in its own UI, so this is the checklist, not a switch we can flip.
 * funnel_start is deliberately absent -- it is a funnel metric, not a conversion.
 */
export const GA4_KEY_EVENT_CANDIDATES: readonly string[] = ['generate_lead', 'quote_complete']

/** Funnel-stepping metrics, in the order GA4's funnel report reads them. */
export const GA4_FUNNEL_METRIC_EVENTS: readonly string[] = ['funnel_start', 'begin_quote']

const GA4_MAX_PARAM_NAME = 40
const GA4_MAX_PARAM_VALUE = 100

/**
 * event_name -> GA4 event names, in emission order. An empty list means "never sent to
 * GA4", and that is a decision rather than a gap:
 *   - page_view        GA4 sends its own; forwarding would double count.
 *   - appointment_booked / customer_won / attribution_capture
 *                      server-side or internal; they live in CAPS storage only.
 */
const GA4_NAMES: Record<EventName, readonly string[]> = {
  page_view: [],
  cta_click: ['cta_click'],
  phone_click: ['phone_click'],
  email_click: ['email_click'],
  funnel_view: ['funnel_view'],
  // begin_quote is GA4's own funnel-start step, emitted alongside the CAPS name.
  funnel_start: ['funnel_start', 'begin_quote'],
  funnel_step_view: ['funnel_step_view'],
  funnel_step_complete: ['funnel_step_complete'],
  funnel_abandon: ['funnel_abandon'],
  // quote_complete is GA4's own funnel-completion step.
  funnel_complete: ['funnel_complete', 'quote_complete'],
  lead_submit: ['lead_submit'],
  // generate_lead is GA4's own key-event name for a lead that passed server-side.
  lead_success: ['generate_lead'],
  lead_failure: ['lead_failure'],
  appointment_booked: [],
  customer_won: [],
  attribution_capture: [],
}

/**
 * Allowlist, and the only optional params GA4 ever sees. Order is fixed so payloads are
 * diffable. Anything absent from this list (lead_id, session_id, anonymous_visitor_id,
 * referrer, landing_page, pathname, props, event_id, timestamp, device, ...) cannot
 * reach GA4, even if a caller puts it on the event.
 */
const OPTIONAL_PARAMS = [
  'funnel_id',
  'funnel_step',
  'funnel_step_index',
  'cta_id',
  'cta_location',
  'source',
  'medium',
  'campaign',
] as const satisfies readonly (keyof TrackingEvent)[]

function ga4Params(e: TrackingEvent): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  const put = (name: string, value: string | number | boolean | undefined): void => {
    if (value === undefined || value === null || value === '') return
    params[name.slice(0, GA4_MAX_PARAM_NAME)] =
      typeof value === 'string' ? value.slice(0, GA4_MAX_PARAM_VALUE) : value
  }
  put('client_id', e.client_id)
  put('site_id', e.site_id)
  for (const key of OPTIONAL_PARAMS) put(key, e[key])
  return params
}

/**
 * Map one validated CAPS event to the GA4 events to send for it (possibly none, possibly
 * two). Each returned event carries its own params object, so a caller mutating one
 * cannot corrupt the other.
 */
export function mapToGa4(e: TrackingEvent): Ga4Event[] {
  const names = GA4_NAMES[e.event_name] ?? []
  return names.map((name) => ({ name, params: ga4Params(e) }))
}
