# JP Wilson Life Insurance Quote Engine — Design Handoff

**Purpose:** give a designer the constraints, approved visual ingredients, and
data boundaries required to produce high-fidelity mobile mockups. This is a
design handoff only; it does not approve an implementation, an integration
change, or a claim that an answer is required by EZLynx.

**Mockup target:** 390 × 844 CSS pixels in the Instagram/Facebook in-app
browser. Design the content area to remain useful when browser chrome and the
mobile keyboard reduce the visible viewport.

**Primary sources reviewed:**

- `QUOTE_ENGINE_TECHNICAL_SPEC.md` — repository-verified delivery contract.
- `life-insurance-funnel-cro-research_2026-08-05.md` — interaction and pacing
  research; not an integration specification.
- `quote-funnel-implementation-blueprint_v1.md` — product and UX proposal;
  fields not present in the existing contract remain provisional.
- `life-insurance-meta-creative-message-match_research_v1.md` — campaign
  message-match and Meta in-app constraints.
- The current site implementation and supplied public brand files.

## 1. Brand Asset Inventory

Use supplied raster artwork exactly as provided. The official marks must not be
redrawn, traced, recolored, cropped, stretched, or regenerated.

| Asset | Exact public path | Current role | Funnel instruction |
|---|---|---|---|
| **Primary official logo** | `public/brand/jpw-lockup-horizontal.png` | Navigation lockup on a light surface; 1231 × 373 px | Use for the compact funnel header on a white or bone surface. Preserve aspect ratio. This is the preferred primary logo. |
| Official alternate lockup | `public/brand/jpw-lockup-stacked.png` | Available alternate; 1090 × 970 px | Reserve for a larger centered, light-surface composition only. Do not substitute it for the compact header. |
| Official crest tile | `public/brand/jpw-crest-tile.png` | Compact brand anchor in the homepage hero and footer; 756 × 760 px | Use as the small square brand mark on dark surfaces or as a restrained transition accent. The existing site clips its supplied white outside margin with a rounded container; it does not edit the artwork. |
| Patrick Wilson portrait | `public/patrick-wilson-headshot.png` | Personal-advisor section; 1024 × 1536 px with transparency | Appropriate for the named-advisor campaign angle and a trust panel. Keep the natural portrait crop; do not create a synthetic replacement. |
| Open Graph image | `public/og-image.png` | Social metadata; 1200 × 630 px | Metadata asset, not a funnel visual treatment unless a later creative brief expressly approves it. |
| Favicon/app icons | `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/icon-512.png` | Browser/app identity | Do not place as content artwork in the funnel. |

### Logo surface rule

Every supplied lockup has a white baked-in background and dark-navy wordmark.
There is **no approved transparent or reversed lockup master**. On navy or other
dark surfaces, either use the crest tile or place the horizontal lockup on an
intentional white plate. Do not invert, tint, blend, or remove its background.

### Visual elements to carry forward

- The official horizontal lockup, the gold-and-navy crest, and restrained gold
  divider-line motif.
- A warm bone primary surface, navy editorial panels, and gold for the one
  primary action or a focused highlight.
- Playfair Display for concise editorial headings, with Inter for all question,
  input, consent, and body copy.
- Patrick's supplied portrait when the campaign promise is explicitly personal
  guidance from Patrick. It should support the promise, not decorate every
  question.
- The current site's crisp, square-cornered controls and generous whitespace.

### Elements not to copy into the funnel

- The homepage's embedded four-step form, full marketing navigation, and
  competing service CTAs. The funnel needs a dedicated, low-distraction flow.
- Unsupported ratings, carrier relationships, review counts, savings claims,
  countdowns, activity counters, or generic stock imagery. Only approved,
  substantiated trust proof may be added.
- A fake reversed logo or a recolored crest. A supplied alternate must be used
  if the client provides one later.

## 2. Brand Tokens

These values are taken from the implemented Tailwind configuration and global
styles, not inferred from the artwork.

| Token | Exact value | Intended design use |
|---|---|---|
| Navy 950 | `#070F1C` | Primary dark panel, dark text, page body background |
| Navy 900 | `#0C1829` | Secondary dark panel and rich text |
| Navy 800 | `#152340` | Supporting navy surface only |
| Navy 700 | `#243D68` | Supporting navy only; not the primary CTA |
| Navy 600 | `#35578F` | Supporting navy only |
| Bone | `#F4F1EA` | Primary warm, light funnel surface |
| Bone dark | `#E8E3D8` | Quiet border or secondary light surface |
| Gold | `#B8882A` | Primary CTA, divider, focus, selected-state accent |
| Gold light | `#D4A84B` | Restrained highlight or secondary gold detail |
| Gold dark | `#8B6520` | CTA hover/pressed state |
| Gold matte | `#A07820` | Supporting gold detail only |

| System area | Current implementation | Design direction |
|---|---|---|
| Display type | `Playfair Display` (400–900, normal/italic) | Use for short headings only. Do not set field labels or dense option copy in serif. |
| UI/body type | `Inter`, then system sans fallback | Use for questions, inputs, option labels, helper copy, progress, legal language, and buttons. |
| Primary button | Gold fill, navy text, semibold, square corners; hover changes to gold dark | One clear primary action per screen. Use a minimum 44 px height; retain high contrast and a non-color selected/focus state. |
| Secondary button | Current site uses navy/white or outline treatments | Use only for Back, call escape hatch, or non-primary choices; do not create equal competing submit actions. |
| Fields/options | Square corners (`rounded-none`), light border, 16 px mobile text, focus gold | Options are generous tap rows/cards, never tiny text links. Inputs should use the correct keyboard (`tel`, numeric ZIP, date) and clear error state. |
| Spacing tendency | Main site uses 24–32 px mobile side padding; 40–56 px section rhythm; 8–20 px control gaps | On the 390 px target, use a **16 px minimum edge gutter**; 20–24 px is preferred where the screen permits. Keep the question, choices, and primary action coherent in one viewport before the keyboard opens. |
| Motion | Fade/reveal is restrained; reduced-motion support exists | The quote funnel should feel immediate. Do not make question changes depend on long animation; honor reduced motion. |

### Mobile implementation constraints that the mockups must honor

- Minimum 44 × 44 px tap targets; use an 8 px or larger gap between adjacent
  touch targets.
- Inputs render at 16 px or larger to avoid iOS auto-zoom.
- The existing site is `viewport-fit=cover`; keep the fixed header, bottom
  action, and final fields clear of safe-area insets and the home indicator.
- Do not rely on hover to disclose an action or selected state.
- Persistent primary action belongs in the thumb-reachable lower portion of the
  visible viewport, but must not cover field errors or legal copy.
- The existing visual language is mostly square-cornered. Do not introduce a
  rounded-app-card system just for the funnel.

## 3. Life Insurance Field Manifest

### Evidence key

- **Confirmed** means supported by the current repository contract or existing
  form/API behavior.
- **Documented external** means the repository documents it as a CRM need, but
  the Jotform, Zapier, or EZLynx dashboards were not inspected.
- **Unverified** means the proposed research/blueprint question has no current
  Jotform/Zapier/EZLynx destination in this repository.

The current API accepts only its normalized `LeadPayload`; unknown JSON fields
are ignored. It requires a name, phone, selected licensed state, and five-digit
ZIP. It allows email to be blank. The current server posts these Jotform fields:
first name, last name, phone, email, state, ZIP, coverage label, situation,
urgency, notes, lead source, and server timestamp.

### Confirmed required for the current submission path

| Internal field key | Visitor-facing question | Input type | Existing website/Jotform field | Known downstream destination | Required by current submission path? | Required for EZLynx? | Status | Recommended funnel position | Sensitive explanation? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `full_name` → `firstName`, `lastName` | “What’s your name?” | Text, one full-name field | Jotform name parts; server splits full name | Jotform → Zapier → external lead/CRM flow | **Yes**: server requires at least one name part | Not independently confirmed; repository says CRM lead needs name | Confirmed website; external CRM detail unverified | 10, late contact transition | No | Preserve one-field split behavior; do not invent a surname if the visitor supplies one word. |
| `phone` | “What’s the best number to reach you?” | `tel`, numeric keypad | Jotform phone | Jotform → Zapier → external lead/CRM flow | **Yes** | Not independently confirmed | Confirmed website | 12, final action | **Yes**: contact/consent explanation | Existing server accepts valid US 10 digits or 11 digits beginning with 1 and rejects repeated digits. |
| `state` | “Which state do you live in?” | Tap single-select | Jotform state | Jotform → Zapier; repository documents State as CRM requirement | **Yes** | **Documented external**, not dashboard-verified | Confirmed website; documented external | 3, early licensing gate | No | Current allowed submitted values: `NC`, `SC`, `GA`, `TN`. Do not add other states without a licensing decision. |
| `zip` | “What’s your ZIP code?” | Five-digit numeric | Jotform ZIP | Jotform → Zapier; repository documents ZIP as CRM requirement | **Yes** | **Documented external**, not dashboard-verified | Confirmed website; documented external | 11, after name | No | Preserve leading zeros; current server strips non-digits then requires exactly five digits. |

### Current handoff fields that must be preserved or explicitly mapped

| Internal field key | Visitor-facing question | Input type | Existing website/Jotform field | Known downstream destination | Required by current submission path? | Required for EZLynx? | Status | Recommended funnel position | Sensitive explanation? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `product` → `coverageLabel` | Not a visitor question; Life is set by this campaign/funnel | Hidden, configuration-owned | Jotform coverage dropdown | Existing Zapier mapping; exact accepted label must remain verified | Not server-required, but both current forms send it | Not confirmed | Confirmed existing handoff field | Set before screen 1 | No | Life v1 must use the exact pre-approved submitted value, distinct from any display label. |
| `life_goal` → possible `situation` | “What brought you here today?” | Tap choice; “Not sure” option | Jotform situation dropdown currently accepts existing Life labels | Jotform → Zapier, exact external mapping unknown | No | Not confirmed | Existing field exists; new mapping is unverified | 1 | No | Current Life options are `Protect my family`, `Replace lost income`, `Cover final expenses`, `Build long-term wealth`, `Not sure yet`. A new wording/value needs Jotform/Zapier verification. |
| `coverage_timing` → possible `urgency` | “How soon are you looking to be covered?” | Tap single-select | Jotform urgency dropdown | Jotform → Zapier, exact external mapping unknown | No | Not confirmed | Existing field exists; product mapping unverified | 9 | No | Current labels: `ASAP`, `Within 30 Days`, `Within 90 Days`, `Just Researching`. Preserve value mapping until dashboards verify any change. |
| `email` | “Email (optional)” | `email` | Jotform email | Jotform → Zapier → external lead/CRM flow | **No** | Not confirmed | Confirmed optional website field | 10, alongside name | No | Current server lowercases and validates nonblank email; blank is allowed. |
| `notes` | No default visitor question | None in V1; optional internal summary only if approved | Jotform textarea | Jotform → Zapier | No | Not confirmed | Confirmed existing field; use is constrained | Not collected in V1 | No | Never put DOB, health, tobacco, address, or detailed underwriting facts into generic notes without an approved data and destination policy. |
| `source` | Not visitor-facing | Configuration-owned | Jotform lead source | Jotform → Zapier / reporting | Always sent by current forms; server does not require it | Not confirmed | Confirmed existing handoff field | Set before screen 1 | No | New campaign source values require Zapier verification before paid traffic. |
| `submissionDate` | Not visitor-facing | Server-generated | Jotform submission date | Jotform → Zapier | Server-owned | Not confirmed | Confirmed | Server only | No | Do not render or generate this in the funnel. |
| `website` | Not visitor-facing | Hidden honeypot | Not forwarded as a normal lead field | Anti-spam only | Required as anti-spam behavior, empty for valid leads | No | Confirmed | Hidden | No | Preserve it in implementation; designer need not mock it. |

### Useful for JP, but not technically required by the existing path

| Internal field key | Visitor-facing question | Input type | Existing website/Jotform field | Known downstream destination | Required by current submission path? | Required for EZLynx? | Status | Recommended funnel position | Sensitive explanation? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `protecting` | “Who are you looking to protect?” | Multi-select plus “I’m not sure” | None | No confirmed destination | No | No evidence | **Unverified** | 2 | No | Valuable for conversation framing; do not submit it until a mapped destination is approved. |
| `date_of_birth` | “What is your date of birth?” | One date field, `MM/DD/YYYY` | None | No confirmed destination | No | No evidence | **Unverified** | 4 | **Yes** | Research says DOB supports meaningful rate discussion, but it is not a current API/Jotform requirement. Explain purpose; do not store in notes as a workaround. |
| `health_tier` | “How would you rate your overall health?” | Four plain-language choices | None | No confirmed destination | No | No evidence | **Unverified** | 5 | **Yes** | This is a low-detail qualifying signal, not underwriting. Do not add condition checklists in v1. |
| `tobacco_use` | “Do you currently use tobacco or nicotine?” | Yes/No | None | No confirmed destination | No | No evidence | **Unverified** | 6 | **Yes** | Sensitive insurance information. Must have a documented collection, retention, and downstream policy before build. |
| `current_life_coverage` | “Do you currently have life insurance?” | Yes/No | None | No confirmed destination | No | No evidence | **Unverified** | 7 | **Yes** | Optional gap-analysis signal; do not frame it as an upsell. |
| `coverage_amount_band` | “How much coverage are you looking for?” | Tap bands plus “Not sure” | None | No confirmed destination | No | No evidence | **Unverified** | 8 | **Yes** | Use ranges, never demand exact income or a medical underwriting calculation. |

### Deferred or unverified external requirements

| Internal field key | Visitor-facing question | Input type | Existing website/Jotform field | Known downstream destination | Required by current submission path? | Required for EZLynx? | Status | Recommended funnel position | Sensitive explanation? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `consent` | Consent language immediately above final action | Checkbox only if legal review requires affirmative action; otherwise disclosure | No current repository field | No confirmed destination | No current API requirement | Not confirmed | **Unverified; legal review required** | 12, with phone | **Yes** | The research calls for durable timestamp, text version, and submission linkage. The present route does not provide that record. Do not design a false “optional” consent. |
| `city` | Do not ask by default | Derived/display only if an approved source is added | Zapier currently uses `Not collected - online lead` | Repository documents City as CRM requirement | No | **Documented external**, not dashboard-verified | Unverified implementation policy | No direct screen | No | A five-digit ZIP does not reliably determine one city. Do not show a city as fact without an approved authoritative lookup and visitor correction. |
| `address_line_1` | Do not ask in V1 unless external mapping proves it necessary | Text only if approved | Zapier currently uses `Not collected - online lead` | Repository documents Address Line 1 as CRM requirement | No | **Documented external**, not dashboard-verified | Deferred / unverified | Agent follow-up by default | Sensitive/privacy context, if collected | Never treat the current placeholder as a real address. |
| `applicant_id`, `opportunity_fields`, `producer_assignment` | Not visitor-facing | None | Not in repository | External EZLynx/Sales Center configuration | No | Not source-verifiable | None | No | Confirm in external dashboards; never create browser-visible placeholders. |

## 4. Confirmed vs. Unverified Requirements

### Confirmed design constraints

1. Keep delivery through `POST /api/submit-lead`; preserve its success/failure
   contract, Jotform-first behavior, fallback behavior, honeypot, validation,
   and analytics rule that conversion occurs only after an accepted response.
2. Collect a name, valid US phone, licensed state, and five-digit ZIP before
   submitting. Email remains optional.
3. The state picker submits only `NC`, `SC`, `GA`, or `TN`.
4. Life must retain the existing approved coverage-label handoff. The exact
   submitted value is an implementation/configuration concern, not editable
   visual copy.
5. Keep PII and sensitive insurance answers out of analytics. Existing generic
   form attempt/failure/success events must remain compatible.
6. Preserve the existing anti-spam honeypot and do not expose it visually.
7. Design for one primary question/action at a time, a late contact ask, 44 px
   targets, 16 px mobile inputs, safe-area clearance, and an accessible Back
   path that retains answers.

### Unverified or approval-dependent requirements

1. The actual Jotform option values and requiredness for any newly proposed
   Life answer.
2. Zapier mappings for new values, a new lead source, Applicant action fields,
   Opportunity action fields, producer assignment, notifications, and task
   failure behavior.
3. Whether the external EZLynx implementation requires last name, city, street
   address, DOB, health, tobacco, current coverage, amount, or consent data.
4. Any city lookup; ZIP alone cannot safely establish a single city without an
   approved authoritative service and correction UX.
5. Consent language, whether it requires an affirmative checkbox, and durable
   consent evidence. This needs legal/compliance review before implementation.
6. The use of real carrier logos, testimonials, review scores, claims, or
   response-time promises. Do not mock these as factual proof without approval.

## 5. Proposed Question Sequence

This is the smallest research-aligned **design sequence** that preserves the
current required handoff and avoids a mobile underwriting interview. It contains
**12 visitor-answer questions**, with the optional email combined into the name
screen, plus two non-question interstitials. A question marked *provisional*
cannot be wired to the existing pipeline until its destination is approved.

| Order | Screen/question | Interaction | Evidence status | Why it belongs / design direction |
|---:|---|---|---|---|
| 0 | Campaign landing + funnel introduction | One strong CTA, optional Call Patrick escape hatch | Design recommendation | Consolidate the landing and introduction; do not put fields in the hero. The headline must preserve the campaign’s noun/promise and never promise an instant price, binding, or coverage. |
| 1 | “What brought you here today?” | Tap option, include “Not sure yet” | Existing `situation` field exists; new wording/value is **unverified** | Starts with a low-anxiety motive and can map to an existing approved Life situation only after verification. |
| 2 | “Who are you looking to protect?” | Multi-select plus “I’m not sure” | **Provisional** | Builds relevance before personal data. No current destination; mock it, but flag it to the implementer. |
| 3 | “Which state do you live in?” | One-tap `NC` / `SC` / `GA` / `TN` | **Confirmed** | Early licensing gate and current server requirement. Mock a graceful out-of-area state separately; do not collect an unsupported state into this funnel. |
| — | Progress interstitial | Chapter-level progress, time expectation, named-advisor reassurance | Design recommendation | No question. Show progress without an exact `x of y` count. Trust proof only if substantiated. |
| 4 | “What is your date of birth?” | Single date field, `MM/DD/YYYY` | **Provisional** | Research recommends it for useful life-quote preparation, but it is not in the existing lead contract. Include an inline “Why we ask” module. |
| 5 | “How would you rate your overall health?” | Four plain-language tap choices | **Provisional** | A lighter alternative to medical history. Do not ask a condition checklist. Include “Why we ask.” |
| 6 | “Do you currently use tobacco or nicotine?” | Yes / No | **Provisional** | Potential rate factor, but sensitive. Include “Why we ask”; no hidden judgement or disqualification copy. |
| 7 | “Do you have life insurance now?” | Yes / No | **Provisional** | Helps a later conversation identify a gap; make it skippable only if the approved configuration does. Include neutral reassurance. |
| 8 | “How much coverage are you looking for?” | Amount bands plus “Not sure” | **Provisional** | Prefer ranges and a no-pressure answer; do not ask income in v1. Include a plain explanation of how the answer helps. |
| 9 | “How soon are you looking to be covered?” | Tap choices | Existing `urgency` field exists; labels/mapping **unverified** | Useful lead-priority signal and compatible in principle with the current urgency field. Preserve existing submitted values until externally verified. |
| — | Value/transition interstitial | Brief personalized non-binding summary and reassurance | Design recommendation | No pricing, eligibility, carrier, or coverage recommendation. This is a pacing transition before contact information. |
| 10 | “What’s your name?” + optional email | Name text field; optional email below | **Confirmed** for name; optional email confirmed | Contact starts late, after enough value/momentum. Do not call the email required. |
| 11 | “What’s your ZIP code?” | Five-digit numeric | **Confirmed** | Required by the server. Do not display a derived city unless the approved lookup/correction flow exists. |
| 12 | “What’s the best number to reach you?” + consent + final CTA | Tel field, consent disclosure, primary quote-request CTA | **Confirmed** phone; consent **unverified** | The highest-friction required field belongs last. The final action should say “Get my quote” / “Request my quote,” not “Submit.” Consent needs legal approval and durable handling before release. |

### Deliberately excluded from Life v1 mockups

- Street address, full medical history, height/weight, Social Security number,
  banking details, exact income, felony/DUI/alcohol/high-risk activity
  questions, and “How did you hear about us?”
- A customer-visible city generated solely from ZIP.
- Any exact quote, price, coverage decision, or assurance of eligibility.

## 6. Screen Inventory

Design reusable **screen templates**, then show the specified content variants.
This produces a sufficiently high-fidelity handoff without manufacturing a
different layout for each answer.

| ID | Mockup screen/template | Required state or content variant | Notes |
|---|---|---|---|
| S1 | Campaign landing / funnel introduction | One campaign-specific headline, support copy, official horizontal lockup, primary CTA, optional Call Patrick escape hatch | Consolidates the requested landing and intro into one screen to reduce friction and design work. No primary site navigation. |
| S2 | Simple-choice question | Q1 Life goal | Full-screen reusable template: compact header, chapter indicator, question, 4–5 large tap choices, Back where applicable. |
| S3 | Multi-choice question | Q2 Who to protect | Same system as S2, but visibly supports select/deselect and a Continue action. |
| S4 | State licensing gate | Q3 NC / SC / GA / TN plus unsupported/out-of-area result | Required distinct state variant. Do not fabricate an outside-state submission path. |
| S5 | Progress/assurance interstitial | After state | Reassurance, what happens next, optional named-agent/headshot trust panel. It asks nothing. |
| S6 | Date-input question | Q4 DOB, including focus/keyboard-safe state | One date field, short inline explanation, visible Back, error treatment. |
| S7 | Sensitive single-choice template | Q5 Health and Q6 tobacco variants | Mock both content variants using one layout. Each needs a clearly visible, expandable or inline “Why we ask” explanation. |
| S8 | Coverage/intent single-choice template | Q7 current coverage, Q8 amount band, Q9 timing variants | Mock the amount-band variant specifically; it must include “Not sure.” Do not imply an actual price. |
| S9 | Value/transition interstitial | Before contact capture | A non-binding summary/roadmap only. No invented recommendation, review, carrier, or savings claim. |
| S10 | Contact details | Q10 name + optional email | Email visibly optional; keyboard-safe field order. |
| S11 | ZIP | Q11 ZIP plus validation error | Numeric keypad intent, five-character error and valid state. Do not render a guessed city. |
| S12 | Final phone + consent | Q12 valid, invalid, and consent disclosure state | Consolidates the requested consent screen with final contact capture. It must leave room for approved legal language directly above the final CTA and preserve a Call escape hatch. |
| S13 | Submission/loading | Disabled duplicate submit and clear waiting state | Do not present a “sent” state before the server accepts the lead. |
| S14 | Success | Human follow-up expectation, safe next action, call link | Never claim an exact response time unless approved and operationally supported. |
| S15 | Submission failure/recovery | Safe retry, retained answers, call alternative | No raw API/Jotform error. This is separate from field validation. |
| S16 | General validation/error state | One simple-choice, one text input, and phone error example | Error must name the correction, retain answers, and not rely only on color. |

### 390 × 844 composition rules

- Keep the logo/header compact: primary content begins high enough to remain
  visible below the in-app browser chrome.
- Aim to fit a short question, its answer choices, and primary action in the
  usable screen before keyboard invocation. Let text fields scroll naturally
  when the keyboard opens; never lock their error/CTA behind it.
- Use chapter progress, not an exact long-form count. Design both a visible
  progress state and an accessible text equivalent.
- Keep final legal/consent text readable rather than shrinking it below
  usability. The design must make room for reviewed copy; it cannot be a
  placeholder that overlaps the CTA.
- The Meta Story ad safe zones (top 14%, bottom 20–35%, 6% sides) apply to ad
  creative, not directly to this web page. The in-app browser still makes this
  funnel unusually sensitive to input friction, browser chrome, and slow load.

## 7. Reusable Configuration Boundaries

Keep the first implementation deliberately small. A product configuration is
data; the renderer and submission boundary are shared. The API route and
Jotform mapping remain website-specific and unchanged for Life v1.

| Boundary | Owns | Must not own |
|---|---|---|
| `funnels/life.ts` | Product ID; exact approved `coverageLabel`; ordered step definitions; display copy; option labels and stable option values; required/optional flags; conditional logic; allowed states; campaign source; allowed product-safe analytics labels; completion copy; explicit adapter mapping | Fetch calls, Jotform parameter IDs, tokens, generic API validation, or unapproved collection of sensitive data |
| Shared quote-funnel components | Compact header; progress; question shell; single/multi-choice renderers; text/date/tel/ZIP controls; “Why we ask”; Back; loading; success/error states; answer preservation and accessibility | Life-specific underwriting wording, CRM mapping, client brand replacement, or assumptions about future products |
| Shared validation | Per-step requiredness; input format; allowed state; answer normalization; product-level completeness; composition with existing `leadValidation` | Authoritative city inference, hidden underwriting decisions, or a replacement for server validation |
| Submission adapter | Converts **approved persisted answers only** into the exact existing `LeadPayload`; uses the exact current source/coverage values; sets honeypot field; calls existing `POST /api/submit-lead` | Direct EZLynx calls, browser secrets, changing Jotform keys, or burying new sensitive fields in `notes` |
| Analytics layer | Existing generic attempt/failure/success events; product ID, funnel version, step, and approved non-sensitive categories; message-match/campaign identifiers only when verified | Name, phone, email, DOB, health, tobacco, ZIP, address, detailed answers, or an acceptance event before server success |

### Future products without needless abstraction

Create `auto.ts`, `home.ts`, `business.ts`, and `commercial-auto.ts` only when
each has a confirmed question set and handoff mapping. They should reuse the
same question shell and adapter pattern but retain their own product questions,
state rules, campaign copy, and approved CRM mappings. Do not extract a generic
cross-client package until a second client has a materially compatible
submission contract.

## 8. External Integration Verification Checklist

The following evidence must be captured in private operational records, not
checked into this public website repository. Redact contact data, tokens,
webhook URLs, and client identifiers.

| Check | What must be verified | Evidence to capture |
|---|---|---|
| Jotform field names | Exact field labels/IDs, option values, requiredness, formatting, and whether a Life source/coverage value is accepted | Redacted builder screenshots or a timestamped field export showing the field ID, label, required toggle, and option values |
| Zapier trigger payload | The exact Jotform payload keys/values delivered for a controlled test; blank optional email behavior | Redacted Zap run/task detail showing input field names, accepted values, timestamp, and successful trigger |
| EZLynx Applicant action | Which Applicant fields Zapier writes; required fields; placeholder handling; validation failure behavior | Redacted action mapping screenshot and controlled-run output; identify each mapped source field and any required destination field |
| EZLynx Opportunity action | Opportunity creation/update behavior, stage, source, and link to Applicant | Redacted action mapping and resulting controlled test record view with timestamp and matching correlation/reference |
| Required address behavior | Whether Address Line 1 is actually required, accepted placeholder policy, and who owns follow-up collection | Redacted field requirement screenshot plus controlled-run result; document whether the placeholder remains, is replaced, or blocks creation |
| Required city behavior | Whether City is required and whether any approved authoritative lookup/correction process exists | Redacted destination requirement screenshot and lookup-provider decision; never treat a ZIP-only guess as proof |
| Product/service mapping | Exact submitted Life coverage label and any mapping to insurance type/product | Redacted Jotform + Zapier mapping screenshots and controlled run demonstrating the label received downstream |
| Lead-source mapping | Exact allowed source text for the Life campaign/funnel and reporting effects | Redacted Zapier mapping/output plus CRM/Sales Center evidence that the source is visible and correct |
| Producer assignment | Which rule assigns the producer and whether Life submissions reach the correct licensed person | Redacted Applicant/Opportunity evidence of the assignment rule and controlled record result |
| Sales Center visibility | Where the applicant/opportunity appears, timing, source, and status after a successful downstream run | Redacted screen capture with timestamp and a non-PII correlation/reference matching the controlled run |
| Notification behavior | What notification follows Jotform acceptance vs. downstream success/failure; recipient and failure handling | Redacted workflow/task evidence and a recipient-side timestamped notification proof; no secrets or full contact details |
| Consent evidence | Exact reviewed wording, checkbox requirement if any, record location, timestamp, text version, and linkage to the lead | Legal/compliance approval plus a controlled record showing redacted consent metadata, not merely the page copy |

## 9. Design Risks

| Risk | Design guardrail |
|---|---|
| Mocking a quote as an instant price or binding outcome | Use “request,” “review,” and “compare options” language. A licensed human reviews the request; the page must not promise a price it cannot show. |
| Treating research questions as current CRM requirements | Label all DOB, health, tobacco, current-coverage, amount, dependent, and consent steps **provisional** until their destination is approved. |
| Adding sensitive data to `notes` to make a mockup “work” | Do not. This would change data minimization and could alter the existing Zapier/EZLynx workflow. |
| Guessing city from a five-digit ZIP | Do not show a city unless an approved lookup and visitor correction flow is designed and implemented. |
| Breaking the known Jotform/Zapier mapping by changing display copy | Keep display labels separate from submitted values. Existing Auto/Home display-vs-submission differences prove this boundary matters. |
| Using a dark wordmark directly on navy | Use the crest or a deliberate white plate until an official reversed/transparent lockup arrives. |
| Shrinking the consent treatment to fit | Consent needs enough hierarchy and space to be read; final CTA may need a scroll-aware layout. |
| Creating high-friction Meta in-app browser interactions | Favor tap choices, correct keyboards, short fields, answer retention, native scroll, and no dependency on autofill. |
| Fake trust proof | Use the real Patrick portrait and approved local/licensing statements. Do not invent review scores, carrier logos, carrier access, or response-time promises. |
| Losing a visitor’s progress | Every screen needs Back and preserved answers; failures must preserve the completed answers and offer safe retry/call paths. |

## 10. Ready-for-Mockup Verdict

**READY FOR MOCKUP: YES — with explicit integration hold points.**

The brand system, exact primary logo, mobile constraints, current submission
minimum, and proposed life-flow structure are sufficiently defined for
high-fidelity 390 × 844 mobile mockups. The designer can proceed using the
screen inventory and mark all provisional questions/consent copy as
**“requires integration/compliance confirmation.”**

This is **not** a build authorization. Implementation remains blocked until:

1. every collected answer has an approved persistence/destination decision;
2. Jotform/Zapier/EZLynx mappings and source values are externally verified;
3. consent language and durable recording are approved; and
4. a controlled end-to-end test plan is approved without exposing production
   client data.

---

### Terminal handoff summary

- **Primary logo:** `public/brand/jpw-lockup-horizontal.png`
- **Brand colors:** `#070F1C`, `#0C1829`, `#152340`, `#243D68`, `#35578F`, `#F4F1EA`, `#E8E3D8`, `#B8882A`, `#D4A84B`, `#8B6520`, `#A07820`
- **Proposed visitor questions:** 12, with optional email on the name screen; two non-question interstitials
- **Confirmed required fields:** name, phone, state (`NC`/`SC`/`GA`/`TN`), five-digit ZIP
- **Unverified fields:** dependent/protection context, DOB, health tier, tobacco/nicotine, current coverage, coverage amount, consent record, city/address policy, and detailed downstream CRM mapping
- **Ready for mockup:** YES (implementation remains gated by external verification)
