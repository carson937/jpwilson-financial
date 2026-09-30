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
  visibleWhen?: (answers: QuoteAnswers) => boolean
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

/**
 * A single choice option. `icon` is optional: the classic ChoiceCard renders a
 * centred glyph, but the commercial business tiles are deliberately typographic
 * and pass no icon. `hint` is a one-line descriptor under the label; `emphasis`
 * promotes an option to a full-width lead tile (used for "both coverages").
 */
export type ChoiceOption = {
  value: string
  label: string
  icon?: StepIcon
  hint?: string
  emphasis?: boolean
}

export type ChoiceStep = StepBase & {
  kind: 'choice'
  options: ReadonlyArray<ChoiceOption>
}

/**
 * A ZIP field that derives the state and gates on the licensed footprint. One
 * screen replaces the old ZIP + state pair: the business ZIP is enough to place
 * the lead and to turn away anything outside NC/SC/GA/TN before contact.
 */
export type ZipStateStep = StepBase & {
  kind: 'zip-state'
  placeholder: string
  icon?: StepIcon
  outOfAreaTitle: string
  outOfAreaBody: string
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

/**
 * "How should we reach you?" for the commercial funnel: full name, phone, and
 * optional email on one screen. Consent is NOT here — it sits on the recap
 * screen with the send action, so the visitor sees exactly what they are
 * agreeing to.
 */
export type BusinessContactStep = StepBase & {
  kind: 'business-contact'
  submitLabel: string
  consentText: string
  consentVersion: string
  privacyHref: string
  summarize: (answers: QuoteAnswers) => ReadonlyArray<RecapRow>
}

export type RecapRow = { label: string; value: string; stepId: string }

/**
 * The review-and-consent screen. Not a numbered question. Shows the answers as
 * editable rows, carries the consent language next to the send button, and is
 * always the last step.
 */
export type RecapStep = StepBase & {
  kind: 'recap'
  submitLabel: string
  consentText: string
  /** Version string written to `answers.consent` and recorded with the lead. */
  consentVersion: string
  privacyHref?: string
  /** Builds the editable summary rows from the collected answers. */
  summarize: (answers: QuoteAnswers) => ReadonlyArray<RecapRow>
}

export type AutoStep = StepBase & { kind: 'location' | 'auto-contact' | 'preferences' }

export type QuoteStep =
  | TextStep
  | StateStep
  | ZipStep
  | ZipStateStep
  | ChoiceStep
  | ContactStep
  | BusinessContactStep
  | RecapStep
  | AutoStep

export type QuoteIntro = {
  /** Small uppercase kicker above the headline. Optional. */
  eyebrow?: string
  headline: string
  /** Rendered as one paragraph under the headline. */
  body: string
  /** Reassurance rows. Claims must be literally true — see AGENTS.md. */
  assurances: ReadonlyArray<string>
  cta: string
  /** Optional "or call" phone number shown as an escape hatch. */
  phone?: string
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
  /** The commercial funnel uses a distinct editorial treatment on the same engine. */
  visualVariant?: 'classic' | 'commercial'
  /**
   * When true, a single-select choice advances on its own a short beat after a
   * fresh pointer selection. Never fires on a revisited step or for keyboard /
   * screen-reader input — see QuestionStep.
   */
  autoAdvanceChoices?: boolean
  startAtFirstStep?: boolean
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
   * Optional per-render step rewrite, given the answers so far. Used for light
   * copy personalisation (e.g. the trade the visitor picked). Pure; must return
   * a step of the same kind and id.
   */
  adaptStep?: (step: QuoteStep, answers: QuoteAnswers) => QuoteStep
  /**
   * Converts validated answers into the existing lead payload. Pure, and unit
   * tested per product — this is the seam where a funnel meets the proven
   * Jotform/Zapier path.
   */
  toLead: (answers: QuoteAnswers) => LeadPayload
}
