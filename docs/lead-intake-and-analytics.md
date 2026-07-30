# Lead Intake And Analytics

## Current Lead Path

Website forms submit to `/api/submit-lead`, which normalizes and validates the
payload before submitting to Jotform form `261496542238059`. Zapier remains the
downstream automation path from Jotform into EZLynx Sales Center.

## Lead Fields And Jotform Mapping

Both forms collect the fields below. State and ZIP are required; the form
enforces the licensed-state list — `NC`, `SC`, `GA`, `TN` — for state and
exactly five numeric digits for ZIP, both client-side and server-side
(`lib/leadValidation.ts`).

The accepted state codes are derived at build time from `LICENSED_STATES` in
`lib/licensedStates.ts`. That array is the single source of truth: adding or
removing a state there updates the form picker, both validators, the footer,
the FAQ, and the structured data at once. Never hardcode a state list here or
in a component.

| Payload field | Jotform submit param | Notes |
|---|---|---|
| firstName / lastName | `q2_q2_fullname0[first]` / `[last]` | Split from one full-name input |
| phone | `q3_q3_phone1[full]` | Required |
| email | `q4_q4_email2` | Optional |
| state | `q12_state` | Required; value is `NC`, `SC`, `GA`, or `TN` (qid 12, name `state`) |
| zip | `q13_zipCode` | Required; 5 digits, leading zeros preserved (qid 13, name `zipCode`) |
| coverageLabel | `q5_q5_dropdown3` | |
| situation | `q6_q6_dropdown4` | |
| urgency | `q7_q7_dropdown5` | |
| notes | `q8_q8_textarea6` | |
| source | `q10_leadSource` | Hero Quiz Funnel / Free Quote Form |
| submissionDate | `q11_submissionDate` | ET timestamp |

State and ZIP are also included in the fallback and notification webhook
payloads (both spread the full lead object) and in the
`form_submission_succeeded` analytics event context.

EZLynx Create Personal Prospect requires Address Line 1, City, State, and Zip.
State and Zip carry real submitted values. Address Line 1 and City are mapped in
the Zap to the honest fixed value `Not collected - online lead`, since the forms
intentionally do not collect street address or city.

The API returns success only when Jotform accepts the submission or when an
optional configured fallback webhook returns a 2xx response. If neither system
accepts the lead, the visitor is asked to call Patrick directly.

## Fallback Intake

Set `LEAD_FALLBACK_WEBHOOK_URL` to a controlled intake endpoint only after that
endpoint durably stores the lead or sends a reliable notification. If the
endpoint requires bearer auth, set `LEAD_FALLBACK_WEBHOOK_SECRET`.

No fallback endpoint is configured by default.

## Optional Notification Redundancy

Set `LEAD_NOTIFICATION_WEBHOOK_URL` to an email/SMS notification service after
that service is ready to receive lead payloads. If the endpoint requires bearer
auth, set `LEAD_NOTIFICATION_WEBHOOK_SECRET`.

Notification delivery is attempted only after the lead has already been accepted
by Jotform or the fallback intake. A notification failure is logged but does not
change the visitor's submission result.

## Analytics

All analytics are inactive until environment variables are configured.

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 measurement ID.
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`: optional Google Ads conversion `send_to` value.
- `NEXT_PUBLIC_META_PIXEL_ID`: optional Meta Pixel ID.

Tracked events:

- `page_view`
- `quiz_started`
- `coverage_selected`
- `quiz_step_completed`
- `form_submission_attempted`
- `form_submission_succeeded`
- `form_submission_failed`
- `phone_cta_clicked`
- `service_cta_clicked`
- `booking_cta_clicked`

The conversion event fires only after `/api/submit-lead` confirms that a lead was
accepted by Jotform or the configured fallback intake.

## Scheduling

Set `NEXT_PUBLIC_BOOKING_URL` to Patrick Wilson's verified booking URL when one
is available. The "Pick a Time" CTA remains hidden until this value is present.

## Zapier To EZLynx Launch Checklist

1. Obtain the Zapier login.
2. Activate or repair the Zapier subscription.
3. Connect the approved EZLynx Sales Center account.
4. Map Jotform fields to EZLynx Sales Center fields.
5. Submit one controlled test lead through the website.
6. Verify the lead record inside EZLynx.
7. Confirm notification delivery.
8. Publish the production site.
