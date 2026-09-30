import type { LeadPayload } from '@/lib/leadValidation'

/**
 * Client → existing lead endpoint. No new route: the Quote Experience posts the
 * same JSON body, to the same URL, that the site's other two forms post.
 */

const SUBMIT_URL = '/api/submit-lead'
// Covers bounded primary + fallback + notification + telemetry calls.
const CLIENT_TIMEOUT_MS = 35_000

/** The message shown when the server gives us nothing usable. */
const GENERIC_ERROR =
  'We could not submit your request. Please call Patrick directly at (866) 786-1585.'

export type SubmitResult =
  | { ok: true; acceptedVia: string; agencyZoomLeadId?: number }
  | { ok: false; message: string; reason: string }

/**
 * A stable id for one completed funnel, so a retry after a flaky network cannot
 * create a second lead. Generated once per submission attempt sequence and
 * reused across retries — that is the entire point.
 */
export function createRequestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `qx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function submitQuoteLead(
  lead: LeadPayload,
  requestId: string,
): Promise<SubmitResult> {
  try {
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, requestId }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    })

    // The route answers with JSON on every path it controls. A parse failure
    // means a platform-level error page, which must not read as success.
    const data = (await res.json().catch(() => null)) as
      | { success?: boolean; acceptedVia?: string; agencyZoomLeadId?: number; error?: string }
      | null

    if (res.ok && data?.success) {
      return {
        ok: true,
        acceptedVia: data.acceptedVia ?? 'unknown',
        ...(data.agencyZoomLeadId ? { agencyZoomLeadId: data.agencyZoomLeadId } : {}),
      }
    }

    return {
      ok: false,
      message: data?.error || GENERIC_ERROR,
      reason: `status_${res.status}`,
    }
  } catch (error) {
    const reason =
      error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network'
    return { ok: false, message: GENERIC_ERROR, reason }
  }
}
