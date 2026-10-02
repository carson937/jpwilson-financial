# STATUS — jpwilson-financial

- **Project:** JP Wilson Financial (client site)
- **Status:** ACTIVE
- **Live URL:** https://www.jpwilsonfinancial.com
- **Deploy platform:** Vercel (project: `jpwilson-financial`)
- **Canonical source:** `/Users/carsonwilson/Projects/jpwilson-financial` (recovered + relocated 2026-07-30)
- **GitHub:** `git@github.com:carson937/jpwilson-financial.git`
- **Owner:** Carson (CAPS)
- **Client:** JP Wilson Financial
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
| Jotform lead form (ID `261496542238059`) | LIVE | Hardcoded, no env vars |
| Zapier lead automation | LIVE | Zap `#368000737` — Jotform → EZLynx |
| EZLynx Sales Center | VERIFIED IN TEST | Prior end-to-end test created a visible Sales Center opportunity. Earlier 403 is resolved. **A new live production test is still required after deployment.** |

## Forms status

- Lead capture form: LIVE and validated (per commit `daa844c: fix: complete lead pipeline — source tracking + form validation`)

## Known issues

- **Live production lead test still outstanding.** The website → Jotform → Zapier → EZLynx chain was proven end to end in testing and produced a visible Sales Center opportunity, but that was a pre-deployment test. Re-run one controlled lead against production after the cutover and confirm the opportunity appears before calling the pipeline live.
- No reversed (light-on-dark) or transparent master logo has been supplied. The footer therefore shows the official crest only, and the navy wordmark is not placed on dark surfaces. Request a reversed master from the client.
- No vector (SVG/AI/EPS/PDF) logo source. Current brand assets are raster and are not print-safe.
- Prior to 2026-07-04, project source was not GitHub-backed (fixed in Phase F)

## Rollback

```bash
# Vercel deploy rollback
cd /Users/carsonwilson/Projects/jpwilson-financial
bunx vercel promote <previous-deployment-url>

# Source rollback
git log --oneline
git reset --hard <sha>
git push --force-with-lease origin main    # only if remote must match reset
```

## Do not

- Do not deploy from any other folder — `/Users/carsonwilson/Projects/jpwilson-financial` is the single canonical source
- Do not read from, edit, or deploy the retired copy at `~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/WEBSITES/jpwilson-financial/`
- Do not replace the official logo files in `public/brand/` with regenerated or redrawn artwork
- Do not rename `.vercel/` folder — that is the deploy link to Vercel project
- Do not commit `.env.local` or any file containing Jotform API keys / EZLynx creds

See `SOURCE_OF_TRUTH.md` for the full deploy + verification protocol.

## Short attribution links (/go/<code>) — 2026-10-02
- `app/go/[code]/route.ts` redirects a registered code to a funnel path with attribution params (registry: `lib/go/links.json`, logic: vendored `lib/caps-tracking/go.ts`). The redirect records nothing and is never cached; a visit is counted only when the destination loads and CAPS tracking reads the params. Unknown/expired codes go to `/` with no params.
- Register codes with `bun <caps-tracking>/scripts/go-link.ts add --config lib/caps-tracking/jp-wilson.json --registry lib/go/links.json --origin https://www.jpwilsonfinancial.com ...` (see caps-tracking docs/ONBOARDING.md).
- `chk-auto` is a verification link (`utm_medium=test`, never stored by ingest).
- Auto funnel is now `live: true` in the CAPS config (dashboard visibility).
