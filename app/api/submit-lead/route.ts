import { NextRequest, NextResponse } from 'next/server'
import {
  LeadPayload,
  isValidOptionalEmail,
  isValidState,
  isValidUSPhone,
  isValidZip,
  normalizeEmail,
  normalizePhone,
  normalizeState,
  normalizeText,
  normalizeZip,
  validateLead,
} from '@/lib/leadValidation'

const JOTFORM_FORM_ID = '261496542238059'
const JOTFORM_URL = `https://submit.jotform.com/submit/${JOTFORM_FORM_ID}/`
const MAX_PAYLOAD_BYTES = 10 * 1024
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

type RateEntry = { count: number; resetAt: number }

const rateLimit = new Map<string, RateEntry>()

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

function logLeadEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  payload: Partial<LeadPayload> & Record<string, unknown> = {},
) {
  const redacted = {
    source: payload.source,
    coverageLabel: payload.coverageLabel,
    situation: payload.situation,
    urgency: payload.urgency,
    state: payload.state,
    hasEmail: Boolean(payload.email),
    phoneLast4: typeof payload.phone === 'string' ? payload.phone.replace(/\D/g, '').slice(-4) : undefined,
    error: payload.error,
    status: payload.status,
    acceptedVia: payload.acceptedVia,
  }

  console[level](JSON.stringify({ scope: 'submit-lead', message, ...redacted }))
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
  }
}

function publicValidationError(lead: LeadPayload) {
  const directError = validateLead(lead)
  if (directError) return directError
  if (!isValidUSPhone(lead.phone)) return 'Please enter a valid phone number.'
  if (!isValidState(lead.state)) return 'Please select your state.'
  if (!isValidZip(lead.zip)) return 'Please enter a valid 5-digit ZIP code.'
  if (!isValidOptionalEmail(lead.email)) return 'Please enter a valid email address or leave it blank.'
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
    q8_q8_textarea6: lead.notes,
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

  const text = await res.text()
  const acceptedStatus = res.status >= 200 && res.status < 400
  const knownValidationFailure = /submission-error|Incomplete Values|error-message/i.test(text)
  const likelyAccepted =
    acceptedStatus &&
    !knownValidationFailure &&
    (res.headers.get('location')?.includes('/thankyou') ||
      text.includes('Thank You') ||
      text.includes('submissionID') ||
      text.length > 0)

  return {
    accepted: likelyAccepted,
    status: res.status,
    reason: knownValidationFailure ? 'jotform_validation' : acceptedStatus ? 'unconfirmed_response' : 'jotform_status',
  }
}

async function submitToFallback(lead: LeadPayload) {
  const fallbackUrl = process.env.LEAD_FALLBACK_WEBHOOK_URL
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
  const notificationUrl = process.env.LEAD_NOTIFICATION_WEBHOOK_URL
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
  const key = clientKey(req)

  if (isRateLimited(key)) {
    logLeadEvent('warn', 'rate_limited', { source: 'unknown' })
    return NextResponse.json({ error: 'Too many attempts. Please wait a minute and try again.' }, { status: 429 })
  }

  const raw = await req.text()
  if (new TextEncoder().encode(raw).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (normalizeText(body.website, 200)) {
    logLeadEvent('warn', 'honeypot_rejected', { source: normalizeText(body.source, 80) })
    return NextResponse.json({ error: 'Unable to accept this request.' }, { status: 400 })
  }

  const lead = normalizeLead(body)
  const validationError = publicValidationError(lead)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 })
  }

  try {
    const jotform = await submitToJotform(lead)
    if (jotform.accepted) {
      logLeadEvent('info', 'accepted_by_jotform', { ...lead, status: jotform.status, acceptedVia: 'jotform' })
      await notifyLeadAccepted(lead, 'jotform')
      return NextResponse.json({ success: true, acceptedVia: 'jotform' })
    }

    logLeadEvent('warn', 'jotform_not_accepted', { ...lead, status: jotform.status, error: jotform.reason })

    const fallback = await submitToFallback(lead)
    if (fallback.accepted) {
      logLeadEvent('info', 'accepted_by_fallback', {
        ...lead,
        status: fallback.status,
        acceptedVia: 'fallback',
      })
      await notifyLeadAccepted(lead, 'fallback')
      return NextResponse.json({ success: true, acceptedVia: 'fallback' })
    }

    logLeadEvent('error', 'lead_delivery_failed', { ...lead, status: fallback.status, error: fallback.reason })
  } catch (error) {
    logLeadEvent('error', 'lead_delivery_exception', {
      ...lead,
      error: error instanceof Error ? error.name : 'unknown_error',
    })
  }

  return NextResponse.json(
    { error: 'We could not safely accept your request. Please call Patrick directly at (866) 786-1585.' },
    { status: 502 },
  )
}
