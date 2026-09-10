/**
 * ============================================================================
 * QUOTE EXPERIENCE — PRODUCT CONFIGURATION TYPES
 * ============================================================================
 *
 * A funnel is DATA, not a component. `funnels/life.ts` declares its screens and
 * how its answers become the existing lead payload; `components/quote-experience`
 * renders any config that satisfies these types.
 *
 * To add a product (auto, home, business):
 *   1. Write `funnels/<product>.ts` exporting a `QuoteProduct`.
 *   2. Add an entry page that renders <QuoteFunnel product={...} />.
 *   3. Register its required answers in PRODUCT_REQUIRED_ANSWERS
 *      (lib/quote-experience/products.ts) so the SERVER enforces them too.
 *
 * No new API route is needed. Every product delivers through the existing
 * POST /api/submit-lead contract — see lib/quote-experience/adapter.ts.
 * ============================================================================
 */

import type { LeadPayload } from '@/lib/leadValidation'

/** Answers are flat strings, keyed by step id. Never persisted server-side. */
export type QuoteAnswers = Record<string, string>

/** Field icons. Kept as a closed union so a config cannot request a missing glyph. */
export type StepIcon = 'user' | 'pin' | 'card' | 'home' | 'building' | 'phone' | 'mail'

type StepBase = {
  /** Stable key. Also the analytics step name — never include PII in it. */
  id: string
  /** The visible question. One question per screen. */
  question: string
  /** Short line under the question. */
  helper?: string
}

export type TextStep = StepBase & {
  kind: 'text'
  placeholder: string
  icon: StepIcon
  /** Maps to the input's autocomplete attribute. */
  autoComplete: string
}

export type StateStep = StepBase & {
  kind: 'state'
  placeholder: string
  icon: StepIcon
}

export type ZipStep = StepBase & {
  kind: 'zip'
  placeholder: string
  icon: StepIcon
}

export type ChoiceStep = StepBase & {
  kind: 'choice'
  options: ReadonlyArray<{ value: string; label: string; icon: StepIcon }>
}

/**
 * The combined contact screen. One screen, two inputs — phone required, email
 * optional. Deliberately not two steps: splitting them reads as an
 * interrogation and measurably costs completions at the highest-intent moment.
 */
export type ContactStep = StepBase & {
  kind: 'contact'
  /** Label on the submit button. "Continue" would be wrong here. */
  submitLabel: string
}

export type AutoStep = StepBase & { kind: 'location' | 'auto-contact' | 'preferences' }
export type QuoteStep = TextStep | StateStep | ZipStep | ChoiceStep | ContactStep | AutoStep

export type QuoteIntro = {
  headline: string
  /** Rendered as one paragraph under the headline. */
  body: string
  /** Reassurance rows. Claims must be literally true — see AGENTS.md. */
  assurances: ReadonlyArray<string>
  cta: string
}

export type QuoteSuccess = {
  heading: string
  subheading: string
  /** "What happens next" rows. Every promise here must be one JP can keep. */
  nextStepsTitle: string
  nextSteps: ReadonlyArray<string>
  ctaLabel: string
  ctaHref: string
}

export type QuoteProduct = {
  /** Stable product key. Must match a PRODUCT_REQUIRED_ANSWERS entry. */
  id: string
  /** Bumped when the question set changes. Sent to analytics, never to Jotform. */
  version: string
  /**
   * The EXACT existing Jotform coverage value. Display copy may differ; this
   * string is a downstream contract and is verified in tests.
   */
  coverageLabel: string
  /** Lead source value. New values need Zapier review before paid traffic. */
  source: string
  intro: QuoteIntro
  steps: ReadonlyArray<QuoteStep>
  success: QuoteSuccess
  /**
   * Converts validated answers into the existing lead payload. Pure, and unit
   * tested per product — this is the seam where a funnel meets the proven
   * Jotform/Zapier path.
   */
  toLead: (answers: QuoteAnswers) => LeadPayload
}
