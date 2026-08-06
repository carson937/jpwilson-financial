> **Status (verified 2026-10-02): PLANNED — NOT CONFIGURED IN PRODUCTION.** No AgencyZoom
> variables exist in the production environment, so this path is dormant and has never been
> production-proven. Production leads go site → Jotform → Zapier → CRM (see
> `lead-intake-and-analytics.md`). Do not describe AgencyZoom as live. Enabling it needs account
> access, the configuration below, and a controlled production test.

# AgencyZoom lead intake

The Auto, Life, and combined General Liability + Workers Comp funnels share
`lib/leads/normalized.ts` and `lib/integrations/agencyzoom.ts`. Credentials and
AgencyZoom account IDs stay server-side. The browser submits only to
`/api/submit-lead`.

## Delivery order

1. Validate the complete funnel payload and attribution envelope.
2. Build a normalized JP lead with the request ID as `lead_id`.
3. Emit `agencyzoom_handoff_started` to CAPS telemetry.
4. Submit personal lines to `POST /v1/api/leads/create` or commercial business
   leads to `POST /v1/api/leads/create-biz-lead`.
5. Return and emit the AgencyZoom integer lead ID when the API supplies one.
6. If AgencyZoom is disabled, incomplete, or unavailable, try the preserved
   Jotform → Zapier intake and then the controlled fallback webhook.

The endpoints and required fields come from AgencyZoom's public OpenAPI document
at `https://app.agencyzoom.com/openapi/agencyzoom.yaml`. No account-specific ID
is guessed. `AGENCYZOOM_MODE=dry-run` returns the exact mapped payload without a
network call outside production; production rejects dry-run and continues to the
preserved intake path.

## Normalized lead and field mapping

| JP normalized value | AgencyZoom value |
|---|---|
| `lead_id` | configured custom field and structured metadata in `notes` |
| `first_name`, `last_name` | `firstname`, `lastname` |
| `email`, `phone` | `email`, `phone` |
| `state`, `zip` | `state`, `zip` |
| product pipeline/stage | `pipelineId`, `stageId` |
| configured source/owner | `leadSourceId`, `assignTo` |
| `insurance_type` | `tagNames` and metadata in `notes` |
| funnel ID/version | configured custom fields and metadata in `notes` |
| campaign/content/ad/batch IDs | configured custom fields and full attribution metadata in `notes` |
| UTM/referral metadata | structured metadata in `notes` |
| funnel answers and qualification | structured metadata in `notes` |
| commercial business name | `name` |
| commercial contact name | `contactName` |
| commercial industry | `businessClassification` |
| commercial employee range | qualification metadata in `notes`; it is not presented as an exact employee count |

AgencyZoom requires email on direct lead creation. The funnels keep email
optional to preserve the approved UX. A phone-only lead therefore bypasses the
direct live call and uses the preserved intake path instead of being discarded.

The route suppresses the common duplicate case in one warm server instance for
five minutes and returns the original AgencyZoom ID. The stable `lead_id` also
travels in notes and, when configured, an AgencyZoom custom field for later
reconciliation. AgencyZoom's documented create request has no native idempotency
key, so cross-instance duplicate prevention requires a durable store or an
account-side lookup after account access is available.

## Account configuration still required

Set the server-only names in `.env.example`: authentication, Auto/Life/commercial
pipeline and stage IDs, lead source ID, assignee ID, and any existing custom-field
names. Verify them in AgencyZoom before setting `AGENCYZOOM_MODE=live`. A controlled
test must then confirm the returned ID and the record's pipeline, stage, owner,
source, tags, and notes. No production credential or account ID belongs in git.
