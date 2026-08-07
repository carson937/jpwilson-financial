import type { LeadPayload } from '@/lib/leadValidation'

/**
 * ============================================================================
 * SERVER-SIDE PRODUCT REQUIREMENTS
 * ============================================================================
 *
 * The base lead contract (name, phone, state, ZIP) is enforced for every form
 * on the site. A quote funnel asks for MORE than that, and a client that skips
 * a step must not be able to post a half-answered lead.
 *
 * So each product declares the extra payload fields the server insists on. This
 * lives in `lib/` rather than in the funnel config because the API route must
 * not import React components, and because the client is not the authority on
 * what the server requires.
 *
 * Adding a funnel means adding a line here. Forgetting to is a caught mistake:
 * an unknown product id is rejected outright.
 * ============================================================================
 */

type RequirableField = Extract<keyof LeadPayload, 'homeOwnership'>

export const PRODUCT_REQUIRED_ANSWERS: Record<string, ReadonlyArray<RequirableField>> = {
  life: ['homeOwnership'],
}

const FIELD_ERRORS: Record<RequirableField, string> = {
  homeOwnership: 'Please tell us whether you own or rent.',
}

/**
 * Returns a visitor-safe error string, or '' when the payload satisfies the
 * product. An unrecognized product id is a client/server version mismatch, not
 * a visitor mistake — it is rejected with a neutral message and logged.
 */
export function validateProductAnswers(lead: LeadPayload): string {
  const product = lead.product

  // No product id: one of the two legacy site forms. Nothing extra to enforce.
  if (!product) return ''

  const required = PRODUCT_REQUIRED_ANSWERS[product]
  if (!required) return 'Unable to accept this request.'

  for (const field of required) {
    if (!lead[field]) return FIELD_ERRORS[field]
  }

  return ''
}
