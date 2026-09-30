import { splitFullName, type LeadPayload } from '@/lib/leadValidation'
import type { QuoteAnswers } from './types'

/**
 * ============================================================================
 * ANSWERS → EXISTING LEAD PAYLOAD
 * ============================================================================
 *
 * The Quote Experience owns question flow. It does NOT own delivery. Every
 * funnel funnels back into the same `LeadPayload` that /api/submit-lead has
 * accepted since launch, so the Jotform → Zapier → EZLynx path is untouched.
 *
 * This module is pure and unit tested. If a mapping is wrong, a test fails
 * here rather than a lead landing malformed in the CRM.
 * ============================================================================
 */

/**
 * Where the Own/Rent answer is delivered.
 *
 * The live Jotform (261496542238059) has thirteen questions and NONE of them is
 * home ownership — verified against the form's question list, not assumed. Until
 * a dedicated field exists, the answer travels as a single labelled line in the
 * existing notes field, which is already mapped downstream.
 *
 * This is deliberately narrow. Home ownership is ordinary property information;
 * it is not health, underwriting, or otherwise regulated data, and nothing of
 * that kind may be routed this way (see QUOTE_ENGINE_TECHNICAL_SPEC.md §11).
 *
 * TO UPGRADE once a real Jotform field is added:
 *   1. Add the question in Jotform, note its qid and name.
 *   2. Send `lead.homeOwnership` to `q{qid}_{name}` in app/api/submit-lead/route.ts.
 *   3. Set HOME_OWNERSHIP_IN_NOTES to false.
 * The payload field is already first-class, so nothing else changes.
 */
export const HOME_OWNERSHIP_IN_NOTES = true

/** The exact prefix a downstream parser can key on. Do not reword casually. */
export const HOME_OWNERSHIP_NOTE_PREFIX = 'Home ownership:'

/**
 * Builds the notes value delivered to Jotform.
 *
 * Called on the SERVER, from the validated payload — never trusted from the
 * client. Otherwise a crafted request could write arbitrary text into the field
 * JP reads, formatted to look like a system-generated line.
 *
 * Any note the visitor typed is preserved and comes first; the structured line
 * is appended so machine parsing stays trivial.
 */
export function composeNotes(visitorNotes: string, homeOwnership: string) {
  const lines: string[] = []
  if (visitorNotes) lines.push(visitorNotes)
  if (HOME_OWNERSHIP_IN_NOTES && homeOwnership) {
    lines.push(`${HOME_OWNERSHIP_NOTE_PREFIX} ${homeOwnership}`)
  }
  return lines.join(' | ')
}

type AdapterConfig = {
  product: string
  coverageLabel: string
  source: string
  /** Step ids to read. Defaults match the shared step builders. */
  keys?: {
    fullName?: string
    state?: string
    zip?: string
    phone?: string
    email?: string
    homeOwnership?: string
  }
}

/**
 * The default answers→payload mapping, shared by every product.
 *
 * `situation` and `urgency` are sent empty on purpose: the locked Life funnel
 * asks neither question, and inventing a value would put fabricated data into
 * a field JP reads. Empty is honest and is exactly what FinalCTA already sends.
 */
export function buildLeadFromAnswers(
  answers: QuoteAnswers,
  config: AdapterConfig,
): LeadPayload {
  const keys = {
    fullName: 'fullName',
    state: 'state',
    zip: 'zip',
    phone: 'phone',
    email: 'email',
    homeOwnership: 'homeOwnership',
    ...config.keys,
  }

  const { firstName, lastName } = splitFullName(answers[keys.fullName] ?? '')
  const homeOwnership = answers[keys.homeOwnership] ?? ''

  return {
    firstName,
    lastName,
    phone: answers[keys.phone] ?? '',
    email: answers[keys.email] ?? '',
    state: answers[keys.state] ?? '',
    zip: answers[keys.zip] ?? '',
    coverageLabel: config.coverageLabel,
    situation: '',
    urgency: '',
    /**
     * Empty by design. The structured Own/Rent line is appended server-side
     * from the validated enum — see composeNotes above. The funnel asks for no
     * free-text note, so there is nothing else to carry.
     */
    notes: '',
    source: config.source,
    product: config.product,
    homeOwnership,
  }
}
