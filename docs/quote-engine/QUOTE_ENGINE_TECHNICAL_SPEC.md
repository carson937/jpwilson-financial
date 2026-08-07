# Quote Engine Technical Specification

**Status:** Architecture review only — no implementation in this document  
**Scope:** JP Wilson Financial website, beginning with a Life Insurance funnel  
**Primary constraint:** Preserve the current website → Jotform → Zapier → CRM delivery contract.

## 1. Current Architecture

The website is a Next.js App Router application. Its lead path is deliberately
small: two client-side forms convert their UI state into the same JSON request,
and one server route owns validation and delivery.

| Layer | Current implementation | Responsibility |
|---|---|---|
| Hero form | `components/LeadCapture.tsx` | Four-step coverage quiz followed by contact details. |
| Bottom form | `components/FinalCTA.tsx` | Shorter free-quote request form. |
| Shared request boundary | `POST /api/submit-lead` | Normalizes, validates, rate-limits, and delivers the lead. |
| Shared validation | `lib/leadValidation.ts` | Normalization and server/client validation helpers. |
| State configuration | `lib/licensedStates.ts` | The allowed state picker values: NC, SC, GA, and TN. |
| Primary intake | Jotform | Receives an application/x-www-form-urlencoded submission from the API route. |
| Automation | Zapier | External to this repository; receives Jotform submissions and performs CRM mapping. |
| CRM | EZLynx / Sales Center | External to this repository; its detailed field mapping is not represented in source code. |
| Analytics | `components/Analytics.tsx`, `lib/analytics.ts` | Sends client events only when configured with public analytics environment variables. |

This design is a sound compatibility boundary for a first Quote Engine. The
website does **not** directly authenticate to EZLynx and contains no EZLynx
credentials. It must continue not to do so. Jotform and the existing Zapier
workflow are the established handoff.

### Current lead contract

```text
Hero Quiz or Free Quote Form
  -> POST /api/submit-lead
  -> normalize + validate + honeypot + local rate limit
  -> Jotform submission
  -> Zapier workflow (external configuration)
  -> EZLynx Applicant / Sales Center workflow (external configuration)
  -> optional post-acceptance notification webhook
```

The API returns a visitor-facing success response only after Jotform accepts the
lead, or after an optional fallback endpoint accepts it. A notification webhook
is best effort and does not decide the visitor-facing result.

## 2. Existing Lead Flow

### Website forms

`LeadCapture` is the current hero funnel. It gathers:

1. Coverage selection.
2. A coverage-specific situation answer.
3. Urgency.
4. Full name, phone, state, ZIP, optional email, and optional notes.

Its visible coverage labels are not always its submitted labels. For example,
the user-facing labels **Commercial Auto Insurance** and **Home & Auto
Insurance** deliberately retain the existing submitted values **Auto
Insurance** and **Home Insurance**. This protects the current Jotform/Zapier
mapping and analytics values.

`FinalCTA` is the current shorter alternative. It gathers full name, phone,
state, ZIP, optional coverage, and optional notes. It sends empty `situation`
and `urgency` values by design.

Both forms:

- Submit JSON only to `/api/submit-lead`.
- Include a visually hidden `website` honeypot field.
- Use the same state and ZIP helpers.
- Track attempt, failure, and success events without sending contact details to
  analytics.

### API route

`app/api/submit-lead/route.ts` is the sole delivery route. Its present behavior
is the compatibility contract that the Quote Engine must preserve:

1. Accept a request body up to 10 KiB.
2. Parse JSON and reject malformed requests.
3. Reject a populated honeypot.
4. Normalize the known payload fields and ignore unknown fields.
5. Validate name, phone, state, ZIP, and optional email.
6. Attempt Jotform first with a ten-second timeout.
7. On a Jotform rejection, attempt the optional fallback endpoint with an
   eight-second timeout.
8. After an accepted lead, optionally send a notification webhook with a
   five-second timeout. Notification failure is logged but does not turn an
   accepted lead into a form failure.
9. Return `200 { success: true, acceptedVia }` only after Jotform or fallback
   acceptance; otherwise return a safe `502` call-the-advisor message.

The route has a per-instance, in-memory limit of five attempts per client key
per minute. It is useful as a lightweight guard, but it is not a distributed
Vercel-wide rate limit.

### Jotform, Zapier, EZLynx, and Sales Center

The server posts the normalized fields to Jotform. Zapier then owns the
downstream transformation. The repository documentation records that the CRM
prospect record needs Address Line 1, City, State, and ZIP; only State and ZIP
are visitor-provided. The current Zapier workflow supplies the honest fixed
text **Not collected - online lead** for Address Line 1 and City.

The repository does not contain:

- A Zapier Zap identifier or task history.
- EZLynx API credentials, field IDs, or write code.
- Sales Center API credentials or an Opportunity schema.

Therefore the exact Zapier-to-EZLynx Applicant/Opportunity mapping is an
external operational dependency. It must be verified in those dashboards during
Quote Engine implementation; it must not be inferred from website code.

### Notifications

Two optional server-only integrations exist:

| Integration | Environment variables | Behavior |
|---|---|---|
| Fallback intake | `LEAD_FALLBACK_WEBHOOK_URL`, optional `LEAD_FALLBACK_WEBHOOK_SECRET` | Tried only after Jotform does not accept a lead. |
| Notification redundancy | `LEAD_NOTIFICATION_WEBHOOK_URL`, optional `LEAD_NOTIFICATION_WEBHOOK_SECRET` | Invoked only after a lead has already been accepted. Failure is non-blocking. |

This repository establishes the contract but does not prove whether either
optional integration is configured in a given deployment.

## 3. Required EZLynx Mapping

The following table distinguishes source-verified behavior from external CRM
requirements. “Required” means required by the website/API or documented as
required by the downstream CRM; it is **not** a claim about undocumented
EZLynx field configuration.

| Field name | Required? | Current source | Can remain? | Needs change? | Notes |
|---|---|---|---|---|---|
| First name | API requires a name; both name parts are not independently required | Split from one full-name input | Yes | No for v1 | Sent separately to Jotform. Preserve the split behavior. |
| Last name | API allows an empty last name when a one-word name is supplied | Split from one full-name input | Yes | Decision before carrier quoting | Do not invent a last name. A life quote provider may require one; make that product-specific. |
| Phone | Yes, website/API | Form input | Yes | No for lead handoff | Current validation is syntactic only. |
| Email | No | Hero form optional; bottom form intentionally sends empty | Yes | No for lead handoff | A product can request it only if justified by the quote workflow. |
| State | Yes, website/API and documented CRM requirement | Confirmed licensed-state picker | Yes | No | Current values are NC, SC, GA, TN. Preserve the two-letter value. |
| ZIP | Yes, website/API and documented CRM requirement | Five-digit ZIP input | Yes | No | Leading zeros are preserved. |
| Address Line 1 | Documented CRM requirement | Zapier fixed text: `Not collected - online lead` | Yes for existing lead intake | Product decision before carrier quote requests | Do not use the placeholder as a real risk address. |
| City | Documented CRM requirement | Zapier fixed text: `Not collected - online lead` | Yes for existing lead intake | Product decision before carrier quote requests | Do not infer a city from ZIP alone. |
| Coverage | Not required by API validator, but present in both current forms | `coverageLabel` | Yes | No for existing labels | Preserve submitted values; display labels may differ from the legacy handoff label. |
| Situation | No | Hero coverage question; empty from bottom form | Yes | No | Existing Jotform mapping exists. Product answers need a documented mapping, not arbitrary text. |
| Urgency | No | Hero urgency question; empty from bottom form | Yes | No | Existing Jotform mapping exists. |
| Notes | No | Optional textarea | Yes | No | Maximum 1,000 normalized characters. Do not place sensitive underwriting data here without an approved policy. |
| Lead source | Not validated as mandatory, but always sent by current forms | `Hero Quiz Funnel` or `Free Quote Form` | Yes | Configuration required for a new funnel | New campaign/source values must be verified in Zapier before release. |
| Submission timestamp | Server generated | America/New_York timestamp | Yes | No | The API, not the client, produces it. |
| EZLynx Applicant ID | Not source-verifiable | External CRM | N/A | No website change | Do not introduce a browser-visible field or fake value. |
| Sales Center Opportunity fields | Not source-verifiable | External CRM/Zapier | N/A | No website change | Confirm their current mapping in Zapier and EZLynx before launch. |

## 4. Validation Review

### Existing validation

| Area | Current behavior |
|---|---|
| Body | Maximum 10 KiB; malformed JSON rejected. |
| Honeypot | A non-empty `website` field is rejected. |
| Name | Client forms require a name. Server requires at least first or last name after normalization. |
| Phone | Removes formatting only for validation; accepts ten US digits or eleven beginning with `1`; rejects alphabetic input and repeated digits. |
| Email | Optional, lowercased, basic syntax validation. |
| State | Uppercased, two characters, must be in `LICENSED_STATES`. |
| ZIP | Non-digits removed, truncated to five digits, then must be exactly five digits. |
| Text fields | Whitespace normalized and length-bounded before delivery. |
| Unknown JSON fields | Not forwarded by the normalizer. |

### Missing validation and quote-quality implications

1. **Coverage is not server-required.** The hero UI makes it mandatory by
   flow, but the bottom form intentionally allows it to be blank. Preserve that
   behavior for existing forms. A new Life Quote Engine should require its own
   product identifier at the funnel boundary.
2. **No state/ZIP consistency check exists.** A syntactically valid ZIP may be
   inconsistent with the selected state. This is acceptable for a simple lead
   request but should be evaluated before a carrier-facing quote request.
3. **No city derivation exists.** A five-digit ZIP does not reliably identify a
   single city; ZIPs can span places, service areas, and PO boxes. Do not derive
   or submit a city as fact without an approved authoritative address/ZIP
   service and a clear correction path for the visitor.
4. **No street address is collected.** This is intentional for the current
   low-friction lead path. A product that needs a risk address must collect it
   transparently in a product-specific step; it must never reuse the CRM
   placeholder as quote input.
5. **Phone and email checks are syntactic.** They do not establish ownership,
   deliverability, or consent. Do not add a verification vendor merely to
   start the Quote Engine.
6. **Rate limiting is instance-local.** It cannot be treated as cross-instance
   abuse protection or idempotency. Preserve it initially; assess a managed
   rate limit only when traffic or abuse justifies it.
7. **No duplicate submission identity exists.** The disabled UI button limits
   accidental double clicks, but the server has no durable idempotency key.
   This is a future hardening decision, not a reason to alter the working lead
   route in the first funnel.

## 5. Recommended Folder Structure

The proposed areas are appropriate. Keep product configuration declarative and
keep the existing lead endpoint in place.

```text
app/
  life-insurance/
    quote/
      page.tsx                 # Life entry point; no dynamic product router initially
  api/
    submit-lead/
      route.ts                 # Existing compatibility endpoint; preserve

components/
  quote-funnel/
    QuoteFunnel.tsx            # Configuration-driven shell
    QuoteProgress.tsx
    QuoteStep.tsx
    fields/                    # Small accessible field renderers only when shared

funnels/
  life.ts                      # First product configuration
  auto.ts                      # Add only when its funnel is approved
  home.ts
  business.ts
  commercial-auto.ts
  medicare.ts

lib/
  quote-funnel/
    types.ts                   # Product, step, answer, and handoff types
    answers.ts                 # Pure answer normalization / serialization helpers
    validation.ts              # Product-level validation composed with existing validation
    lead-adapter.ts            # Converts approved answers to the current LeadPayload
    analytics.ts               # Product-safe event parameter construction

docs/
  quote-engine/
    QUOTE_ENGINE_TECHNICAL_SPEC.md
```

Do **not** add a generic dynamic route or a database in the first Life funnel.
One explicit Life page makes the release surface obvious and prevents product
eligibility rules from becoming routing logic. Add shared components only after
the first funnel proves what is genuinely common.

## 6. Quote Engine Architecture

### Compatibility-first boundary

The engine should own question flow and product answers. The existing API route
should continue to own delivery.

```text
Life product configuration
  -> QuoteFunnel UI state
  -> product validation
  -> lead adapter
  -> existing LeadPayload
  -> existing POST /api/submit-lead
  -> existing Jotform/Zapier/EZLynx path
```

For the first release, the adapter must produce the same payload shape already
accepted by `/api/submit-lead`:

```ts
type LeadPayload = {
  firstName: string
  lastName: string
  phone: string
  email: string
  state: string
  zip: string
  coverageLabel: string
  situation: string
  urgency: string
  notes: string
  source: string
  website?: string
}
```

### What remains exactly the same

- `/api/submit-lead` URL, success/failure response contract, and `POST` use.
- Jotform parameter mapping and accepted submitted label values.
- Jotform-first, fallback-second delivery sequence and timeout behavior.
- Notification-after-acceptance behavior.
- Honeypot, size limit, validation helpers, normalization limits, and safe log
  redaction.
- Existing generic analytics events and the rule that conversion fires only
  after an accepted submission.
- Existing Hero and Final CTA forms until they are intentionally migrated and
  regression-tested.

### What becomes reusable

- The `LeadPayload` boundary and existing `leadValidation` helpers.
- Product answer typing, step progression, conditional-question evaluation,
  back navigation, and answer serialization.
- A product-to-lead adapter with explicit tests of the resulting payload.
- Product-safe analytics parameters: product ID, funnel version, step, and
  non-sensitive answer category. Never send health history, DOB, address, or
  contact details to analytics.

### What stays website-specific

- Brand components, layout, copy, CTA placement, and the existing Hero/Final
  CTA presentation.
- The Jotform endpoint and its parameter mapping.
- Licensed-state configuration and client-specific public claims.
- Existing lead source names and CRM handoff configuration.

### When to add a new API route

Do not add one merely because the UI is called a Quote Engine. Add a separate
server route only when approved product-specific data cannot be represented by
the existing lead contract **and** the Jotform/Zapier/EZLynx mapping has been
updated and tested. Until then, routing every quote through the proven endpoint
is the lower-risk option.

## 7. Configuration Strategy

Each product file should be data, not a bespoke component. A configuration owns
the question sequence and the explicit mapping of approved answers into the
existing handoff fields.

### Suggested configuration responsibilities

| Configuration area | Examples |
|---|---|
| Identity | Stable `id` (`life`), configuration version, product display name. |
| Entry | Explicit route, primary CTA label, source/campaign label subject to Zapier approval. |
| Eligibility | Supported state policy and any approved product availability guard. |
| Steps | Question ID, question text, input type, options, required flag, and conditional visibility. |
| Answer taxonomy | Stable option values separate from user-facing labels. |
| Handoff | Exact `coverageLabel`, source, and documented mapping of answers to `situation`, `urgency`, and/or a structured human-readable notes summary. |
| Analytics | Safe event context: product ID, funnel version, step number, and non-PII categories. |
| Completion | Success copy and next action. |

### Shared engine responsibilities

- Render the declared steps accessibly.
- Maintain state, back navigation, progress, validation errors, and submit
  state.
- Execute product-level validation and then the existing lead validation.
- Call the lead adapter and existing submission endpoint.
- Ensure a user cannot submit when a required product answer is absent.
- Keep raw product answers in browser memory only unless an approved server
  mapping explicitly persists them.

### Product files

Start with `funnels/life.ts`. Add `auto.ts`, `home.ts`, `business.ts`,
`commercial-auto.ts`, and `medicare.ts` only after each product’s required data,
compliance review, and CRM mapping have been defined. An empty or speculative
configuration file is not useful.

For Life v1, map the product to the existing **Life Insurance** submitted
coverage label exactly. If additional Life questions need to reach the advisor,
document their compact notes format and its maximum length first. Do not silently
overload `notes` with regulated health or underwriting data.

## 8. Future Scalability

This design supports more products, campaigns, and landing pages without
replacing the current pipeline:

- **Additional products:** Add a reviewed configuration and an explicit entry
  page; retain one shared renderer and handoff adapter.
- **Campaigns:** Pass a reviewed source/campaign identifier from the entry page
  into configuration. Keep it within the existing source field constraints and
  confirm Zapier handles it before using it in paid traffic.
- **Landing pages:** Reuse the same product configuration but set an explicit
  source such as a campaign name; do not duplicate API routes or Jotform
  mappings.
- **Additional insurance clients:** Extract only product-agnostic engine code
  after a second client has a materially similar approved handoff contract.
  Client credentials, Jotform schemas, state rules, branded copy, and CRM
  mappings remain client-specific.

The intended maturity path is configuration reuse, not a premature multi-tenant
platform.

## 9. Risks

| Risk | Why it matters | Preservation / mitigation |
|---|---|---|
| Changing Jotform question parameters or submitted labels | Can break the Zapier mapping without a website error. | Freeze existing values; make adapters explicit; test a controlled lead after any mapping change. |
| Treating a display label as a submitted value | Current Auto/Home labels intentionally differ. | Keep stable machine/submission values separate from display copy. |
| Replacing the API route | Risks regressions in fallback, notification, validation, conversion, and CRM handoff. | Reuse the route for Life v1. |
| Collecting risk address too early | Conflicts with the current low-friction experience and could create privacy/compliance exposure. | Collect it only in a product step when actually required; never use CRM placeholders as facts. |
| Deriving city from ZIP | Can produce an incorrect locality. | Collect city when needed or use an approved authoritative service with user correction. |
| Adding detailed quote answers to analytics | Could expose personal or insurance-related data to analytics vendors. | Track only product/version/step and pre-approved non-sensitive categories. |
| Assuming Jotform acceptance proves Sales Center completion | Zapier/EZLynx are external and can fail after the website returns success. | Verify task/applicant evidence in external dashboards for each launch test. |
| Instance-local rate limiter | Does not prevent distributed or cross-instance abuse. | Preserve current behavior; separately decide on managed protection only when justified. |
| Duplicates from retries | There is no durable idempotency key. | Keep UI submit lock; assess a correlation/idempotency design before higher-volume paid traffic. |
| Public repository documentation | Internal URLs, credentials, dashboard identifiers, and client PII must not be added. | Document interfaces and verification steps, never secrets or private operational identifiers. |

## 10. Build Recommendations

1. **Begin with a Life-only explicit page and one configuration.** Do not refactor
   the existing Hero or Final CTA in the same change.
2. **Build a pure lead adapter before the UI.** Its input/output contract should
   prove that a Life completion becomes the existing `LeadPayload` with the
   existing Life coverage label.
3. **Keep product fields in the browser until a documented handoff needs them.**
   Add no database, CRM client, or server persistence for v1.
4. **Decide the product data minimum with the licensed advisor and Zapier owner.**
   The decision must specify which answers are a lead note, which are new mapped
   fields, and which must not be collected.
5. **Treat Jotform/Zapier/EZLynx mapping as a release dependency.** Any new
   server field or source value requires an external mapping review and one
   controlled end-to-end test.
6. **Preserve analytics compatibility.** Keep existing events; add only
   documented, non-sensitive quote-funnel parameters.

## 11. Final Go/No-Go Checklist

### Go only when all are true

- [ ] The Life funnel has an approved question set, copy, and data-minimization
      review.
- [ ] Every Life answer has an explicit destination: existing field, approved
      structured notes format, or intentionally not persisted.
- [ ] The adapter emits the existing `LeadPayload` shape and exact submitted
      `coverageLabel` value.
- [ ] Existing Hero and Final CTA submission behavior remains regression-tested.
- [ ] Jotform parameters and expected option values are verified unchanged, or
      a reviewed Jotform update is in place.
- [ ] Zapier owner confirms handling for the new source and any new mapped
      values.
- [ ] EZLynx/Sales Center owner confirms the destination record receives the
      required real values and only approved placeholders.
- [ ] The address/city policy is decided for Life; no placeholder is used as
      carrier-facing quote data.
- [ ] Analytics events contain no PII or sensitive insurance answers.
- [ ] A controlled non-customer lead has passed from the new Life funnel through
      Jotform, Zapier, and the CRM, with direct dashboard evidence.
- [ ] Failure behavior is verified: Jotform rejection, fallback absence, and a
      safe visitor-facing error.

### No-go conditions

- The intended product questions require unapproved new CRM fields.
- A proposed mapping relies on an undocumented EZLynx field or guessed Zapier
  behavior.
- The funnel would submit street address, city, health, or other underwriting
  data through the existing generic notes field without an approved data policy.
- A change alters Jotform field identifiers, submitted labels, source values, or
  success semantics without an external end-to-end verification.

## Review Evidence and Limits

This specification is based on the current repository implementation:
`components/LeadCapture.tsx`, `components/FinalCTA.tsx`,
`app/api/submit-lead/route.ts`, `lib/leadValidation.ts`,
`lib/licensedStates.ts`, `lib/analytics.ts`, and
`docs/lead-intake-and-analytics.md`.

It does not inspect Jotform, Zapier, EZLynx, or Sales Center dashboards. Any
statement about their detailed mapping is limited to the repository’s existing
documentation and must be re-verified in those systems before implementation.
