# Commercial lead request — current v4

Local preview only. No production deployment or migration.

The current approved direction is a compact offer hero with one CTA, followed by five screens:
industry, business ZIP, employee range excluding owners, reason/timing, and contact with consent.
No coverage selector is shown. The normalized coverage need defaults to `unsure` (advisor guidance),
not a fabricated request for both policies. Employees include zero and unsure options.
Claims and company-name screens remain removed. Legacy supplied fields remain accepted and mapped.
Optional email expands on contact. Summary edits return directly to contact after validation.

## Evidence and limits

- https://www.perspective.co/ — mobile-first, interactive journeys. Vendor claims are not JP conversion evidence.
- https://www.insureon.com/ — begins its landing interaction with business type; supports asking a relevant question immediately, not proof that coverage-first beats industry-first.
- https://www.nextinsurance.com/ — online quote-and-purchase journey; its underwriting requirements should not be copied into an advisor lead request.
- https://app.agencyzoom.com/openapi/agencyzoom.yaml — create-biz-lead references BizLeadDataRequest; business name is not marked required. Verify account behavior before activation.

Conversion improvement is a hypothesis requiring real traffic and qualified-lead outcomes.
Existing ZIP-prefix licensing gate is preserved; it is not an authoritative ZIP existence lookup.
Optional email still uses existing fallback for live phone-only delivery. Direct account proof awaits access.

## Reusable design principles

The offer screen earns the first click with one wide CTA. Describe unfamiliar coverage in plain language. Use native
radio cards with selection feedback and deliberate keyboard continuation. Branch only when it
removes an irrelevant question. Show branch-aware progress. Keep contact, editable summary,
visible consent and explicit submission together. Use real brand assets and small advisor identity.
Never trade accessible labels, readable text, or honest delivery state for fewer pixels.
