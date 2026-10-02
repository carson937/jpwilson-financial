// VENDORED from @caps/tracking@084a2ae — do not edit here; change caps-tracking and re-run scripts-vendor.sh

/**
 * Declarative per-client tracking config. Onboarding a client = one of these objects.
 * No analytics code is copied per client: funnels are registered here and inherit
 * start/step/complete/abandon instrumentation from client.ts.
 */

export interface FunnelStepConfig {
  id: string
  label: string
}

export interface FunnelConfig {
  id: string
  version: string
  label: string
  /** Ordered. funnel_step_index is the position in this list. */
  steps: FunnelStepConfig[]
  /** Route prefixes that belong to this funnel (longest prefix wins). */
  paths: string[]
  /** Defaults to true. Dashboards list only live funnels; set false for built-but-unlaunched funnels (tracking still works). */
  live?: boolean
}

export interface ClientTrackingConfig {
  client_id: string
  site_id: string
  /** Hostnames this site legitimately runs on; ingestion rejects events for others. */
  domains: string[]
  ga_measurement_id?: string
  vercel_analytics: boolean
  /** Same-origin ingestion route, e.g. /api/t */
  ingest_endpoint: string
  funnels: FunnelConfig[]
}

const STEP_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/
const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/
const GA_RE = /^G-[A-Z0-9]{6,12}$/
const HOST_RE = /^(?=.{1,253}$)([a-z0-9-]+\.)+[a-z]{2,}$|^localhost$/

export function validateConfig(cfg: ClientTrackingConfig): string[] {
  const errors: string[] = []
  if (!SLUG_RE.test(cfg.client_id)) errors.push('client_id must be a lowercase slug')
  if (cfg.client_id.endsWith('--qa')) errors.push('client_id may not end in --qa (reserved for the QA traffic lane)')
  if (!SLUG_RE.test(cfg.site_id)) errors.push('site_id must be a lowercase slug')
  if (!cfg.domains.length) errors.push('at least one domain is required')
  for (const d of cfg.domains) if (!HOST_RE.test(d)) errors.push(`invalid domain: ${d}`)
  if (cfg.ga_measurement_id !== undefined && !GA_RE.test(cfg.ga_measurement_id)) errors.push('ga_measurement_id must look like G-XXXXXXXXXX')
  if (!cfg.ingest_endpoint.startsWith('/') && !cfg.ingest_endpoint.startsWith('https://')) errors.push('ingest_endpoint must be a path or https URL')
  const funnelIds = new Set<string>()
  for (const f of cfg.funnels) {
    if (!SLUG_RE.test(f.id)) errors.push(`funnel id invalid: ${f.id}`)
    if (funnelIds.has(f.id)) errors.push(`duplicate funnel id: ${f.id}`)
    funnelIds.add(f.id)
    if (!f.steps.length) errors.push(`funnel ${f.id} has no steps`)
    const stepIds = new Set<string>()
    for (const s of f.steps) {
      if (!STEP_RE.test(s.id)) errors.push(`funnel ${f.id} step id invalid: ${s.id}`)
      if (stepIds.has(s.id)) errors.push(`funnel ${f.id} duplicate step: ${s.id}`)
      stepIds.add(s.id)
    }
    if (!f.paths.length || f.paths.some((p) => !p.startsWith('/'))) errors.push(`funnel ${f.id} needs route prefixes starting with /`)
  }
  return errors
}

/** Longest-prefix match so /auto-insurance/quote wins over /auto-insurance. */
export function funnelForPath(cfg: ClientTrackingConfig, pathname: string): FunnelConfig | undefined {
  let best: FunnelConfig | undefined
  let bestLen = -1
  for (const f of cfg.funnels) {
    for (const p of f.paths) {
      const match = pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
      if (match && p.length > bestLen) {
        best = f
        bestLen = p.length
      }
    }
  }
  return best
}

export function stepIndexOf(funnel: FunnelConfig, stepId: string): number {
  return funnel.steps.findIndex((s) => s.id === stepId)
}

export function hostAllowed(cfg: ClientTrackingConfig, host: string): boolean {
  const h = host.toLowerCase().replace(/:\d+$/, '')
  return cfg.domains.some((d) => h === d || h === `www.${d}` || (d.startsWith('www.') && h === d.slice(4)))
}

/** Ids of funnels that are actually live (live !== false). */
export function liveFunnelIds(cfg: ClientTrackingConfig): string[] {
  return cfg.funnels.filter((f) => f.live !== false).map((f) => f.id)
}
