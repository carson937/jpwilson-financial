import type { NormalizedJPLead } from '@/lib/leads/normalized'

const API_ORIGIN = 'https://api.agencyzoom.com'
const REQUEST_TIMEOUT_MS = 8_000

type Fetcher = typeof fetch
type AgencyZoomEnv = Readonly<Record<string, string | undefined>>
type AgencyZoomMode = 'disabled' | 'dry-run' | 'live'
type AgencyZoomIds = { pipelineId: number; stageId: number; leadSourceId: number; assignTo: number }

export type AgencyZoomPayload = {
  firstname: string
  lastname: string
  email: string
  phone: string
  notes: string
  pipelineId: number
  stageId: number
  leadSourceId: number
  assignTo: number
  country: 'USA'
  state: string
  zip: string
  tagNames: string
  customFields: Array<{ fieldName: string; fieldValue: string[] }>
  name?: string
  contactName?: string
  businessClassification?: string
}

export type AgencyZoomResult = {
  status: 'not_configured' | 'dry_run' | 'accepted' | 'failed'
  accepted: boolean
  agencyZoomLeadId?: number
  reason?: string
  payload: AgencyZoomPayload | null
}

function positiveInt(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function mode(env: AgencyZoomEnv): AgencyZoomMode {
  return env.AGENCYZOOM_MODE === 'live' || env.AGENCYZOOM_MODE === 'dry-run' ? env.AGENCYZOOM_MODE : 'disabled'
}

function idsFor(lead: NormalizedJPLead, env: AgencyZoomEnv): AgencyZoomIds | null {
  const suffix = lead.insurance_type === 'commercial_gl_wc' ? 'COMMERCIAL' : lead.insurance_type.toUpperCase()
  const pipelineId = positiveInt(env[`AGENCYZOOM_PIPELINE_ID_${suffix}`])
  const stageId = positiveInt(env[`AGENCYZOOM_STAGE_ID_${suffix}`])
  const leadSourceId = positiveInt(env[`AGENCYZOOM_LEAD_SOURCE_ID_${suffix}`] ?? env.AGENCYZOOM_LEAD_SOURCE_ID)
  const assignTo = positiveInt(env[`AGENCYZOOM_ASSIGN_TO_${suffix}`] ?? env.AGENCYZOOM_ASSIGN_TO)
  return pipelineId && stageId && leadSourceId && assignTo ? { pipelineId, stageId, leadSourceId, assignTo } : null
}

function customFields(lead: NormalizedJPLead, env: AgencyZoomEnv) {
  const mappings: Array<[string | undefined, string]> = [
    [env.AGENCYZOOM_CF_LEAD_ID, lead.lead_id],
    [env.AGENCYZOOM_CF_FUNNEL_ID, lead.funnel_id],
    [env.AGENCYZOOM_CF_FUNNEL_VERSION, lead.funnel_version],
    [env.AGENCYZOOM_CF_CAMPAIGN_ID, lead.attribution.campaign_id],
    [env.AGENCYZOOM_CF_CONTENT_ID, lead.attribution.content_id],
    [env.AGENCYZOOM_CF_AD_ID, lead.attribution.ad_id],
    [env.AGENCYZOOM_CF_BATCH_ID, lead.attribution.batch_id],
  ]
  return mappings.flatMap(([fieldName, fieldValue]) => fieldName && fieldValue ? [{ fieldName, fieldValue: [fieldValue] }] : [])
}

function notesFor(lead: NormalizedJPLead) {
  const metadata = {
    lead_id: lead.lead_id,
    funnel_id: lead.funnel_id,
    funnel_version: lead.funnel_version,
    insurance_type: lead.insurance_type,
    attribution: lead.attribution,
    funnel_answers: lead.funnel_answers,
    qualification_data: lead.qualification_data,
    submitted_at: lead.submitted_at,
  }
  return [lead.downstream.notes, `JP funnel metadata: ${JSON.stringify(metadata)}`].filter(Boolean).join(' | ').slice(0, 4000)
}

export function buildAgencyZoomPayload(lead: NormalizedJPLead, env: AgencyZoomEnv = process.env): AgencyZoomPayload | null {
  const ids = idsFor(lead, env)
  if (!ids) return null
  const payload: AgencyZoomPayload = {
    firstname: lead.first_name,
    lastname: lead.last_name,
    email: lead.email,
    phone: lead.phone,
    notes: notesFor(lead),
    ...ids,
    country: 'USA',
    state: lead.state,
    zip: lead.zip,
    tagNames: `jp-funnel;${lead.insurance_type}`,
    customFields: customFields(lead, env),
  }
  if (lead.insurance_type === 'commercial_gl_wc') {
    payload.name = lead.qualification_data.businessName
    payload.contactName = `${lead.first_name} ${lead.last_name}`.trim()
    payload.businessClassification = lead.qualification_data.industry
  }
  return payload
}

let cachedJwt: { value: string; expiresAt: number } | null = null

async function authToken(env: AgencyZoomEnv, fetcher: Fetcher) {
  if (env.AGENCYZOOM_BEARER_TOKEN) return env.AGENCYZOOM_BEARER_TOKEN
  if (cachedJwt && cachedJwt.expiresAt > Date.now()) return cachedJwt.value
  if (!env.AGENCYZOOM_USERNAME || !env.AGENCYZOOM_PASSWORD) return null
  const response = await fetcher(`${API_ORIGIN}/v1/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, redirect: 'error',
    body: JSON.stringify({ username: env.AGENCYZOOM_USERNAME, password: env.AGENCYZOOM_PASSWORD }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) return null
  const data = await response.json() as { jwt?: unknown }
  if (typeof data.jwt !== 'string' || !data.jwt) return null
  cachedJwt = { value: data.jwt, expiresAt: Date.now() + 10 * 60 * 1000 }
  return data.jwt
}

export async function submitAgencyZoomLead(
  lead: NormalizedJPLead,
  options: { env?: AgencyZoomEnv; fetcher?: Fetcher } = {},
): Promise<AgencyZoomResult> {
  const env = options.env ?? process.env
  const fetcher = options.fetcher ?? fetch
  const currentMode = mode(env)
  if (currentMode === 'disabled') return { status: 'not_configured', accepted: false, reason: 'agencyzoom_disabled', payload: null }
  const payload = buildAgencyZoomPayload(lead, env)
  if (!payload) return { status: 'not_configured', accepted: false, reason: 'agencyzoom_ids_missing', payload: null }
  if (currentMode === 'dry-run') {
    if (env.VERCEL_ENV === 'production') return { status: 'failed', accepted: false, reason: 'agencyzoom_dry_run_forbidden_in_production', payload }
    return { status: 'dry_run', accepted: true, payload }
  }
  if (!lead.email) return { status: 'failed', accepted: false, reason: 'agencyzoom_email_required', payload }

  try {
    const token = await authToken(env, fetcher)
    if (!token) return { status: 'not_configured', accepted: false, reason: 'agencyzoom_auth_missing', payload }
    const endpoint = lead.insurance_type === 'commercial_gl_wc' ? '/v1/api/leads/create-biz-lead' : '/v1/api/leads/create'
    const response = await fetcher(`${API_ORIGIN}${endpoint}`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({})) as { id?: unknown; result?: unknown }
    const id = typeof data.id === 'number' && Number.isSafeInteger(data.id) ? data.id : undefined
    if (!response.ok || data.result === false) return { status: 'failed', accepted: false, reason: `agencyzoom_http_${response.status}`, payload }
    return { status: 'accepted', accepted: true, ...(id ? { agencyZoomLeadId: id } : {}), payload }
  } catch (error) {
    return { status: 'failed', accepted: false, reason: error instanceof DOMException && error.name === 'TimeoutError' ? 'agencyzoom_timeout' : 'agencyzoom_unavailable', payload }
  }
}
