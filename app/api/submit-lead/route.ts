import { NextRequest, NextResponse } from 'next/server'
import {
  isValidOptionalEmail,
  isValidOptionalHomeOwnership,
  isValidState,
  isValidUSPhone,
  isValidZip,
  normalizeEmail,
  normalizeHomeOwnership,
  normalizePhone,
  normalizeState,
  normalizeText,
  normalizeZip,
  validateLead,
} from '@/lib/leadValidation'
import type { LeadPayload } from '@/lib/leadValidation'
import { composeNotes } from '@/lib/quote-experience/adapter'
import { validateProductAnswers } from '@/lib/quote-experience/products'
import { composeAutoNotes, type AutoQualification } from '@/lib/quote-experience/auto'
import { composeCommercialNotes } from '@/lib/quote-experience/commercial'
import { AUTO_SOURCES, UUID, type FunnelEvent, type TrafficSource } from '@/lib/quote-experience/telemetry'
import { forwardAutoEvent } from '@/lib/quote-experience/telemetry-server'
import { normalizeJPLead } from '@/lib/leads/normalized'
import { submitAgencyZoomLead } from '@/lib/integrations/agencyzoom'
import { randomUUID } from 'node:crypto'

const JOTFORM_FORM_ID = '261496542238059'
const JOTFORM_URL = `https://submit.jotform.com/submit/${JOTFORM_FORM_ID}/`
const MAX_PAYLOAD_BYTES = 10 * 1024
const MAX_JOTFORM_RESPONSE_BYTES = 64 * 1024
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 5

/**
 * Every outbound call is bounded. Without a timeout a hung Jotform (or a
 * misbehaving webhook) holds the function open until the platform's own limit,
 * burning execution time and leaving the visitor on a spinner. The Jotform
 * budget is the largest because it is the primary delivery path; the
 * notification is fire-and-forget and gets the shortest.
 */
const JOTFORM_TIMEOUT_MS = 10_000
const FALLBACK_TIMEOUT_MS = 8_000
const NOTIFICATION_TIMEOUT_MS = 5_000

/**
 * How long a completed submission is remembered so a retry of the SAME request
 * cannot create a second lead. Long enough to cover a visitor tapping again
 * after a slow response; short enough that a genuine second enquiry is not
 * swallowed.
 */
const DEDUPE_TTL_MS = 5 * 60 * 1000
const DEDUPE_MAX_ENTRIES = 500

const ALLOWED_BODY_FIELDS = new Set([
  'firstName',
  'lastName',
  'phone',
  'email',
  'state',
  'zip',
  'coverageLabel',
  'situation',
  'urgency',
  'notes',
  'source',
  'website',
  'product',
  'homeOwnership',
  'requestId',
  'insured', 'timing', 'vehicles', 'driving', 'bundle', 'consent', 'sessionId', 'autoSource',
  'funnelId', 'funnelVersion', 'trafficSource', 'platform', 'campaignId', 'contentId', 'adId', 'batchId',
  'utmSource', 'utmMedium', 'utmCampaign', 'utmContent', 'utmTerm', 'referralSource', 'referralHost',
  'businessName', 'coverageNeed', 'industry', 'employeeRange', 'currentCoverage', 'insuranceStatus', 'claims',
])

const FIELD_LIMITS: Record<string, number> = {
  firstName: 80,
  lastName: 80,
  phone: 40,
  email: 254,
  state: 2,
  zip: 5,
  coverageLabel: 120,
  situation: 160,
  urgency: 80,
  notes: 1000,
  source: 80,
  website: 200,
  product: 40,
  homeOwnership: 10,
  requestId: 64,
  insured: 10, timing: 20, vehicles: 10, driving: 10, bundle: 10, consent: 40, sessionId: 36, autoSource: 10,
  funnelId: 40, funnelVersion: 40, trafficSource: 20, platform: 80, campaignId: 160, contentId: 160,
  adId: 160, batchId: 160, utmSource: 160, utmMedium: 160, utmCampaign: 160, utmContent: 160,
  utmTerm: 160, referralSource: 160, referralHost: 160, businessName: 160, coverageNeed: 30,
  industry: 40, employeeRange: 20, currentCoverage: 20, insuranceStatus: 20, claims: 20,
}

const COVERAGE_LABELS = new Set([
  'Life Insurance',
  'Business Insurance',
  'Auto Insurance',
  'Home Insurance',
  'Health Insurance',
  'Medicare',
  'Medicare (Advantage / Supplement / Part D)',
  'Home / Renters Insurance',
  'Multiple, not sure yet',
  'Not specified',
])

const LEAD_SOURCES = new Set(['Hero Quiz Funnel', 'Free Quote Form', 'Life Quote Funnel', 'Commercial Quote Funnel'])
const SITUATIONS = new Set([
  'Individual or family plan',
  'Small group / employees',
  'Losing current coverage',
  'Comparing plan costs',
  'Just exploring options',
  'Turning 65 soon',
  'Already on Medicare',
  'Losing employer coverage',
  'Reviewing my options',
  'Helping a family member',
  'Protect my family',
  'Replace lost income',
  'Cover final expenses',
  'Build long-term wealth',
  'Not sure yet',
  'Looking for a lower rate',
  'Buying a vehicle',
  'Switching insurance companies',
  'Need commercial coverage',
  'Homeowner policy',
  'Rental property',
  'Condo',
  'Renters insurance',
  'Comparing rates',
  'Contractor',
  'Trucking',
  'Retail',
  'Professional Services',
  'Other',
])
const URGENCY_VALUES = new Set(['ASAP', 'Within 30 Days', 'Within 90 Days', 'Just Researching'])
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/
const HTML_METACHARACTER = /[<>]/
const REQUEST_ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|qx-\d{13}-[a-z0-9]{8})$/i

type RateEntry = { count: number; resetAt: number }

const rateLimit = new Map<string, RateEntry>()

/**
 * Accepted request ids → the result already returned for them.
 *
 * Instance-local, like the rate limiter. It reliably stops the common case (a
 * double tap, or a client retry after a timeout that actually succeeded) and
 * makes no claim beyond that — serverless instances do not share memory, so
 * this is not distributed idempotency and must not be described as such.
 */
const recentSubmissions = new Map<string, { acceptedVia: string; agencyZoomLeadId?: number; expiresAt: number }>()

function rememberSubmission(requestId: string, acceptedVia: string, agencyZoomLeadId?: number) {
  if (!requestId) return

  // Bounded: a long-lived instance must not accumulate ids without limit.
  // `forEach` rather than for..of — this project targets ES5 output, where
  // iterating a Map directly requires downlevelIteration.
  if (recentSubmissions.size >= DEDUPE_MAX_ENTRIES) {
    const now = Date.now()
    const expired: string[] = []
    recentSubmissions.forEach((entry, key) => {
      if (entry.expiresAt <= now) expired.push(key)
    })
    expired.forEach((key) => recentSubmissions.delete(key))

    // Still full of live entries: drop the oldest insertion to make room.
    if (recentSubmissions.size >= DEDUPE_MAX_ENTRIES) {
      let oldest: string | undefined
      recentSubmissions.forEach((_entry, key) => {
        if (oldest === undefined) oldest = key
      })
      if (oldest !== undefined) recentSubmissions.delete(oldest)
    }
  }

  recentSubmissions.set(requestId, { acceptedVia, ...(agencyZoomLeadId ? { agencyZoomLeadId } : {}), expiresAt: Date.now() + DEDUPE_TTL_MS })
}

function findRecentSubmission(requestId: string) {
  if (!requestId) return null

  const entry = recentSubmissions.get(requestId)
  if (!entry) return null

  if (entry.expiresAt <= Date.now()) {
    recentSubmissions.delete(requestId)
    return null
  }

  return entry
}

function clientKey(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || req.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(key: string) {
  const now = Date.now()
  const current = rateLimit.get(key)

  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > RATE_LIMIT_MAX
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      // Lead responses are never useful in an intermediary cache.
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Reject bad input instead of silently truncating or stripping it into something else. */
function validateRequestShape(body: Record<string, unknown>) {
  for (const key of Object.keys(body)) {
    if (!ALLOWED_BODY_FIELDS.has(key)) return 'Invalid request.'
  }

  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = body[field]
    if (value === undefined) continue
    if (
      typeof value !== 'string' ||
      value.length > limit ||
      CONTROL_CHARACTER.test(value) ||
      HTML_METACHARACTER.test(value)
    ) {
      return 'Invalid request.'
    }
  }

  return ''
}

function isSameOriginRequest(req: NextRequest) {
  const origin = req.headers.get('origin')
  // Browsers send Origin on fetch/XHR POSTs. Requests without it are still
  // constrained to JSON, while this keeps operational health checks possible.
  if (!origin) return true
  try {
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    const host = forwardedHost || req.headers.get('host') || req.nextUrl.host
    const forwardedProtocol = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const protocol = forwardedProtocol || req.nextUrl.protocol.replace(':', '')
    return new URL(origin).origin === `${protocol}://${host}`
  } catch {
    return false
  }
}

function isJsonRequest(req: NextRequest) {
  return req.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() === 'application/json'
}

function isHttpsUrl(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function validateLeadClassification(lead: LeadPayload) {
  if (lead.product === 'auto' && (lead.coverageLabel !== 'Auto Insurance' || lead.source !== 'Hero Quiz Funnel' || lead.notes || lead.situation || lead.urgency || lead.homeOwnership)) return 'Unable to accept this request.'
  if (lead.product === 'commercial' && (lead.coverageLabel !== 'Business Insurance' || lead.source !== 'Commercial Quote Funnel' || lead.notes || lead.situation || lead.urgency || lead.homeOwnership)) return 'Unable to accept this request.'
  if (!COVERAGE_LABELS.has(lead.coverageLabel)) return 'Unable to accept this request.'
  if (!LEAD_SOURCES.has(lead.source)) return 'Unable to accept this request.'
  if (lead.situation && !SITUATIONS.has(lead.situation)) return 'Unable to accept this request.'
  if (lead.urgency && !URGENCY_VALUES.has(lead.urgency)) return 'Unable to accept this request.'

  // The locked Life funnel has one canonical product, source, and coverage
  // combination. Prevent a crafted request from turning a product answer into
  // arbitrary CRM/Jotform fields.
  if (
    lead.product === 'life' &&
    (lead.coverageLabel !== 'Life Insurance' ||
      lead.source !== 'Life Quote Funnel' ||
      lead.situation ||
      lead.urgency ||
      lead.notes)
  ) {
    return 'Unable to accept this request.'
  }

  return ''
}

function logLeadEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  payload: Record<string, unknown> = {},
) {
  const safeMetadata = {
    requestId: payload.requestId,
    source: payload.source,
    product: payload.product,
    error: payload.error,
    status: payload.status,
    acceptedVia: payload.acceptedVia,
  }

  console[level](JSON.stringify({ scope: 'submit-lead', message, ...safeMetadata }))
}

function normalizeLead(body: Record<string, unknown>): LeadPayload {
  return {
    firstName: normalizeText(body.firstName, 80),
    lastName: normalizeText(body.lastName, 80),
    phone: normalizePhone(body.phone),
    email: normalizeEmail(body.email),
    state: normalizeState(body.state),
    zip: normalizeZip(body.zip),
    coverageLabel: normalizeText(body.coverageLabel, 120),
    situation: normalizeText(body.situation, 160),
    urgency: normalizeText(body.urgency, 80),
    notes: normalizeText(body.notes, 1000),
    source: normalizeText(body.source, 80),
    website: normalizeText(body.website, 200),
    product: normalizeText(body.product, 40),
    homeOwnership: normalizeHomeOwnership(body.homeOwnership),
    funnelId: normalizeText(body.funnelId, 40), funnelVersion: normalizeText(body.funnelVersion, 40),
    sessionId: normalizeText(body.sessionId, 36), trafficSource: normalizeText(body.trafficSource ?? body.autoSource, 20),
    platform: normalizeText(body.platform, 80), campaignId: normalizeText(body.campaignId, 160),
    contentId: normalizeText(body.contentId, 160), adId: normalizeText(body.adId, 160), batchId: normalizeText(body.batchId, 160),
    utmSource: normalizeText(body.utmSource, 160), utmMedium: normalizeText(body.utmMedium, 160),
    utmCampaign: normalizeText(body.utmCampaign, 160), utmContent: normalizeText(body.utmContent, 160), utmTerm: normalizeText(body.utmTerm, 160),
    referralSource: normalizeText(body.referralSource, 160), referralHost: normalizeText(body.referralHost, 160),
    ...(body.product === 'auto' ? {
      insured: normalizeText(body.insured, 10), timing: normalizeText(body.timing, 20),
      vehicles: normalizeText(body.vehicles, 10), driving: normalizeText(body.driving, 10),
      bundle: normalizeText(body.bundle, 10), consent: normalizeText(body.consent, 40),
    } : {}),
    ...(body.product === 'commercial' ? {
      businessName: normalizeText(body.businessName, 160), coverageNeed: normalizeText(body.coverageNeed, 30),
      industry: normalizeText(body.industry, 40), employeeRange: normalizeText(body.employeeRange, 20),
      currentCoverage: normalizeText(body.currentCoverage, 20), insuranceStatus: normalizeText(body.insuranceStatus, 20), claims: normalizeText(body.claims, 20),
      consent: normalizeText(body.consent, 40),
    } : {}),
  }
}

function publicValidationError(lead: LeadPayload) {
  const directError = validateLead(lead)
  if (directError) return directError
  if (!isValidUSPhone(lead.phone)) return 'Please enter a valid phone number.'
  if (!isValidState(lead.state)) return 'Please select your state.'
  if (!isValidZip(lead.zip)) return 'Please enter a valid 5-digit ZIP code.'
  if (!isValidOptionalEmail(lead.email)) return 'Please enter a valid email address or leave it blank.'
  if (!isValidOptionalHomeOwnership(lead.homeOwnership ?? '')) {
    return 'Please tell us whether you own or rent.'
  }
  // Product funnels require more than the base lead contract. The client
  // enforces this for feedback; the server enforces it for real.
  const productError = validateProductAnswers(lead)
  if (productError) return productError
  const classificationError = validateLeadClassification(lead)
  if (classificationError) return classificationError
  return ''
}

async function submitToJotform(lead: LeadPayload) {
  const submissionDate = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  /**
   * The live form has no home-ownership question — verified against its
   * question list, not assumed. Until one exists, the validated Own/Rent value
   * is appended to the notes field as a single labelled line, built here from
   * the sanitised payload rather than from anything the client formatted.
   *
   * See lib/quote-experience/adapter.ts for the upgrade path.
   */
  const notes = composeNotes(lead.notes, lead.homeOwnership ?? '')

  const params = new URLSearchParams({
    formID: JOTFORM_FORM_ID,
    'q2_q2_fullname0[first]': lead.firstName,
    'q2_q2_fullname0[last]': lead.lastName,
    'q3_q3_phone1[full]': lead.phone,
    q4_q4_email2: lead.email,
    q12_state: lead.state,
    q13_zipCode: lead.zip,
    q5_q5_dropdown3: lead.coverageLabel,
    q6_q6_dropdown4: lead.situation,
    q7_q7_dropdown5: lead.urgency,
    q8_q8_textarea6: notes,
    q10_leadSource: lead.source,
    q11_submissionDate: submissionDate,
  })

  const res = await fetch(JOTFORM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'manual',
    signal: AbortSignal.timeout(JOTFORM_TIMEOUT_MS),
  })

  const responseLength = Number(res.headers.get('content-length') ?? '0')
  if (Number.isFinite(responseLength) && responseLength > MAX_JOTFORM_RESPONSE_BYTES) {
    return { accepted: false, status: res.status, reason: 'jotform_response_too_large' }
  }

  const text = await res.text()
  if (new TextEncoder().encode(text).length > MAX_JOTFORM_RESPONSE_BYTES) {
    return { accepted: false, status: res.status, reason: 'jotform_response_too_large' }
  }
  const acceptedStatus = res.status >= 200 && res.status < 400
  const knownValidationFailure = /submission-error|Incomplete Values|error-message/i.test(text)
  const likelyAccepted =
    acceptedStatus &&
    !knownValidationFailure &&
    (res.headers.get('location')?.includes('/thankyou') ||
      text.includes('Thank You') ||
      text.includes('submissionID'))

  return {
    accepted: likelyAccepted,
    status: res.status,
    reason: knownValidationFailure ? 'jotform_validation' : acceptedStatus ? 'unconfirmed_response' : 'jotform_status',
  }
}

async function submitToFallback(lead: LeadPayload) {
  const fallbackUrl = isHttpsUrl(process.env.LEAD_FALLBACK_WEBHOOK_URL)
  if (!fallbackUrl) return { accepted: false, status: 0, reason: 'fallback_not_configured' }

  const res = await fetch(fallbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.LEAD_FALLBACK_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${process.env.LEAD_FALLBACK_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      ...lead,
      submittedAt: new Date().toISOString(),
      intakeSource: 'jpwilsonfinancial.com',
    }),
    signal: AbortSignal.timeout(FALLBACK_TIMEOUT_MS),
  })

  return {
    accepted: res.ok,
    status: res.status,
    reason: res.ok ? 'accepted' : 'fallback_status',
  }
}

/**
 * Never throws. This runs *after* the lead has already been delivered, and it
 * sits inside the handler's try/catch — so a rejected fetch (timeout, DNS,
 * connection reset) would otherwise fall through to the 502 branch and tell the
 * visitor their request failed when it actually succeeded. They would then
 * submit again, producing a duplicate lead. Notification is best-effort by
 * design: log the failure, keep the success response.
 */
async function notifyLeadAccepted(lead: LeadPayload, acceptedVia: string) {
  const notificationUrl = isHttpsUrl(process.env.LEAD_NOTIFICATION_WEBHOOK_URL)
  if (!notificationUrl) return

  try {
    const res = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.LEAD_NOTIFICATION_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.LEAD_NOTIFICATION_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({
        lead,
        acceptedVia,
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
    })

    if (!res.ok) {
      logLeadEvent('warn', 'notification_failed', { ...lead, status: res.status, acceptedVia })
    }
  } catch (error) {
    logLeadEvent('warn', 'notification_exception', {
      ...lead,
      error: error instanceof Error ? error.name : 'unknown_error',
      acceptedVia,
    })
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return json({ error: 'Invalid request.' }, 403)
  }

  if (!isJsonRequest(req)) {
    return json({ error: 'Content-Type must be application/json.' }, 415)
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > MAX_PAYLOAD_BYTES) {
    return json({ error: 'Request is too large.' }, 413)
  }

  const key = clientKey(req)

  if (isRateLimited(key)) {
    logLeadEvent('warn', 'rate_limited')
    return json({ error: 'Too many attempts. Please wait a minute and try again.' }, 429)
  }

  const raw = await req.text()
  if (new TextEncoder().encode(raw).length > MAX_PAYLOAD_BYTES) {
    return json({ error: 'Request is too large.' }, 413)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  if (!isPlainObject(parsed)) {
    return json({ error: 'Invalid request.' }, 400)
  }

  const body = parsed
  const shapeError = validateRequestShape(body)
  if (shapeError) {
    return json({ error: shapeError }, 400)
  }
  if (body.product !== 'auto' && ['insured', 'timing', 'vehicles', 'driving', 'bundle'].some((field) => body[field] !== undefined)) return json({ error: 'Invalid request.' }, 400)
  if (body.product !== 'commercial' && ['businessName', 'coverageNeed', 'industry', 'employeeRange', 'currentCoverage', 'insuranceStatus', 'claims'].some((field) => body[field] !== undefined)) return json({ error: 'Invalid request.' }, 400)
  // `consent` is written by both the Auto and the combined commercial funnel.
  if (body.product !== 'auto' && body.product !== 'commercial' && body.consent !== undefined) return json({ error: 'Invalid request.' }, 400)
  const isProductFunnel = ['auto', 'life', 'commercial'].includes(String(body.product))
  if (isProductFunnel && (typeof body.requestId !== 'string' || !UUID.test(body.requestId) || typeof body.sessionId !== 'string' || !UUID.test(body.sessionId) || !(AUTO_SOURCES as readonly unknown[]).includes(body.trafficSource ?? body.autoSource) || body.funnelId !== body.product || typeof body.funnelVersion !== 'string')) return json({ error: 'Invalid request.' }, 400)

  if (normalizeText(body.website, 200)) {
    logLeadEvent('warn', 'honeypot_rejected')
    return json({ error: 'Unable to accept this request.' }, 400)
  }

  const lead = normalizeLead(body)
  const reportOutcome = async (event: FunnelEvent, acceptedVia?: 'agencyzoom' | 'agencyzoom_dry_run' | 'jotform' | 'fallback', agencyZoomLeadId?: number) => {
    if (!isProductFunnel) return
    await forwardAutoEvent({ eventId: randomUUID(), sessionId: body.sessionId as string,
      source: (body.trafficSource ?? body.autoSource) as TrafficSource, requestId: body.requestId as string,
      funnelId: body.product as 'auto' | 'life' | 'commercial', funnelVersion: body.funnelVersion as string,
      occurredAt: new Date().toISOString(), event, ...(acceptedVia ? { acceptedVia } : {}),
      ...(agencyZoomLeadId ? { agencyZoomLeadId } : {}),
    })
  }
  const validationError = publicValidationError(lead)
  if (validationError) {
    await reportOutcome('submit_failure')
    return json({ error: validationError }, 422)
  }

  /**
   * A repeat of an already-accepted request returns the original success
   * instead of delivering the lead twice. The visitor sees the same outcome
   * they would have seen; JP does not get a duplicate.
   */
  const requestId = normalizeText(body.requestId, 64)
  if (requestId && !REQUEST_ID.test(requestId)) {
    return json({ error: 'Invalid request.' }, 400)
  }

  const alreadyAccepted = findRecentSubmission(requestId)
  if (alreadyAccepted) {
    logLeadEvent('info', 'duplicate_suppressed', {
      requestId,
      acceptedVia: alreadyAccepted.acceptedVia,
    })
    await reportOutcome('submit_success', alreadyAccepted.acceptedVia as 'agencyzoom' | 'agencyzoom_dry_run' | 'jotform' | 'fallback', alreadyAccepted.agencyZoomLeadId)
    return json({ success: true, acceptedVia: alreadyAccepted.acceptedVia, ...(alreadyAccepted.agencyZoomLeadId ? { agencyZoomLeadId: alreadyAccepted.agencyZoomLeadId } : {}) })
  }

  const submittedAt = new Date().toISOString()
  if (lead.product === 'auto') lead.notes = composeAutoNotes(lead as AutoQualification, requestId, submittedAt)
  if (lead.product === 'commercial') lead.notes = composeCommercialNotes(lead, requestId, submittedAt)
  const normalizedLead = isProductFunnel ? normalizeJPLead(lead, requestId, submittedAt) : null

  try {
    if (normalizedLead) {
      await reportOutcome('agencyzoom_handoff_started')
      const agencyZoom = await submitAgencyZoomLead(normalizedLead)
      if (agencyZoom.accepted) {
        const acceptedVia = agencyZoom.status === 'dry_run' ? 'agencyzoom_dry_run' : 'agencyzoom'
        rememberSubmission(requestId, acceptedVia, agencyZoom.agencyZoomLeadId)
        await Promise.all([
          reportOutcome('agencyzoom_handoff_success', acceptedVia, agencyZoom.agencyZoomLeadId),
          reportOutcome('submit_success', acceptedVia, agencyZoom.agencyZoomLeadId),
        ])
        return json({ success: true, acceptedVia, ...(agencyZoom.agencyZoomLeadId ? { agencyZoomLeadId: agencyZoom.agencyZoomLeadId } : {}) })
      }
      await reportOutcome('agencyzoom_handoff_failure')
      logLeadEvent('warn', 'agencyzoom_not_accepted', { requestId, product: lead.product, source: lead.source, error: agencyZoom.reason })
    }

    // A transport failure still gets the configured fallback opportunity.
    const jotform = await submitToJotform(lead).catch(() => ({ accepted: false, status: 0, reason: 'jotform_unavailable' }))
    if (jotform.accepted) {
      logLeadEvent('info', 'accepted_by_jotform', {
        requestId,
        product: lead.product,
        source: lead.source,
        status: jotform.status,
        acceptedVia: 'jotform',
      })
      rememberSubmission(requestId, 'jotform')
      await notifyLeadAccepted(lead, 'jotform')
      await reportOutcome('submit_success', 'jotform')
      return json({ success: true, acceptedVia: 'jotform' })
    }

    logLeadEvent('warn', 'jotform_not_accepted', {
      requestId,
      product: lead.product,
      source: lead.source,
      status: jotform.status,
      error: jotform.reason,
    })

    const fallback = await submitToFallback(lead)
    if (fallback.accepted) {
      logLeadEvent('info', 'accepted_by_fallback', {
        requestId,
        product: lead.product,
        source: lead.source,
        status: fallback.status,
        acceptedVia: 'fallback',
      })
      rememberSubmission(requestId, 'fallback')
      await notifyLeadAccepted(lead, 'fallback')
      await reportOutcome('submit_success', 'fallback')
      return json({ success: true, acceptedVia: 'fallback' })
    }

    logLeadEvent('error', 'lead_delivery_failed', {
      requestId,
      product: lead.product,
      source: lead.source,
      status: fallback.status,
      error: fallback.reason,
    })
  } catch (error) {
    logLeadEvent('error', 'lead_delivery_exception', {
      requestId,
      product: lead.product,
      source: lead.source,
      error: error instanceof Error ? error.name : 'unknown_error',
    })
  }

  await reportOutcome('submit_failure')
  return json(
    { error: 'We could not safely accept your request. Please call Patrick directly at (866) 786-1585.' },
    502,
  )
}

function methodNotAllowed() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: 'POST', 'Cache-Control': 'no-store, max-age=0' },
  })
}

export function GET() {
  return methodNotAllowed()
}

export function PUT() {
  return methodNotAllowed()
}

export function PATCH() {
  return methodNotAllowed()
}

export function DELETE() {
  return methodNotAllowed()
}

export function OPTIONS() {
  return methodNotAllowed()
}
