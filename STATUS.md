# STATUS — jpwilson-financial

> This repository is public. Deploy identifiers, automation IDs, vendor account names,
> dashboard links, and local filesystem paths are kept out of this file deliberately.
> Build and release state is recorded here because developers need it.

- **Project:** JP Wilson Financial (client site)
- **Status:** ACTIVE
- **Live URL:** https://www.jpwilsonfinancial.com
- **Deploy platform:** Vercel (project name matches this repository)
- **Canonical source:** this repository (source recovered + relocated 2026-07-30)
- **Stack:** Next.js + React + Tailwind
- **Last verified live:** 2026-07-04
- **Last local verification:** 2026-07-30 (typecheck, lint, production build, route + mobile QA)

## Analytics (2026-10-01)

- GA4 `G-837LY8SGTM` (one tag from the root layout), Vercel Web Analytics, and the CAPS tracking SDK (vendored in `lib/caps-tracking`,
  events to the central CAPS analytics API). Funnels: auto, life, commercial, homepage quiz/form.
- Verify a deploy: `node scripts/analytics-smoke.mjs https://www.jpwilsonfinancial.com --ingest-host caps-analytics.vercel.app`.
- Key events to mark in GA4: `generate_lead`, `quote_complete`.

## Integrations

| Integration | Status | Notes |
|---|---|---|
| Jotform lead form | LIVE | Form ID lives in `.env.example` and `app/api/submit-lead/route.ts`; no server env vars |
| Zapier lead automation | LIVE | Routes Jotform submissions downstream. Configured in Zapier, not in this repo. |
| Downstream delivery | VERIFIED IN TEST | Confirmed end to end in pre-deployment testing. A controlled production lead (2026-10-02) was accepted by the site's Jotform step; downstream receipt is unverified. |
| AgencyZoom | PLANNED — NOT CONFIGURED | Code path exists but is dormant: no production variables, never production-proven. Leads do not use it. |

## Forms status

- Lead capture form: LIVE and validated (per commit `daa844c: fix: complete lead pipeline — source tracking + form validation`)

## Known issues

- **Launch checklist item:** one controlled production lead. The site → Jotform → Zapier
  chain was proven end to end in pre-deployment testing; re-run a single controlled lead
  against production after cutover and confirm it arrives. See
  `docs/lead-intake-and-analytics.md`.
- No reversed (light-on-dark) or transparent master logo has been supplied. The footer
  therefore shows the official crest only, and the navy wordmark is not placed on dark
  surfaces. Request a reversed master from the client.
- No vector (SVG/AI/EPS/PDF) logo source. Current brand assets are raster and are not
  print-safe.
- Prior to 2026-07-04, project source was not GitHub-backed (fixed in Phase F).

## Rollback

Run from the repository root:

```bash
# Vercel deploy rollback
bunx vercel ls
bunx vercel promote <previous-deployment-url>

# Source rollback
git log --oneline
git reset --hard <sha>
git push --force-with-lease origin main    # only if remote must match reset
```

## Do not

- Do not deploy from any folder other than a clone of this repository. If a second local
  copy of this site exists, it is stale.
- Do not replace the official logo files in `public/brand/` with regenerated or redrawn
  artwork.
- Do not rename `.vercel/` — it is the deploy link to the Vercel project, and it is
  gitignored.
- Do not commit `.env.local` or any file containing Jotform or CRM credentials.

See `SOURCE_OF_TRUTH.md` for the full deploy + verification protocol, and `AGENTS.md` for
agent working rules.


## Short attribution links (/go/<code>) — 2026-10-02
- `app/go/[code]/route.ts` redirects a registered code to a funnel path with attribution params (registry: `lib/go/links.json`, logic: vendored `lib/caps-tracking/go.ts`). The redirect records nothing and is never cached; a visit is counted only when the destination loads and CAPS tracking reads the params. Unknown/expired codes go to `/` with no params.
- Register codes with `bun <caps-tracking-package>/scripts/go-link.ts add --config lib/caps-tracking/jp-wilson.json --registry lib/go/links.json --origin https://www.jpwilsonfinancial.com ...` (see the shared CAPS tracking package docs).
- `chk-auto` is a verification link (`utm_medium=test`, never stored by ingest).
- Auto funnel is now `live: true` in the CAPS config (dashboard visibility).
