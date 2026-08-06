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

## Integrations

| Integration | Status | Notes |
|---|---|---|
| Jotform lead form | LIVE | Form ID lives in `.env.example` and `app/api/submit-lead/route.ts`; no server env vars |
| Zapier lead automation | LIVE | Routes Jotform submissions downstream. Configured in Zapier, not in this repo. |
| Downstream delivery | VERIFIED IN TEST | Confirmed end to end in pre-deployment testing. One controlled production lead remains on the launch checklist. |

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
