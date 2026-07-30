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
