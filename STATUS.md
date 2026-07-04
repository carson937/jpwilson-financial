# STATUS — jpwilson-financial

- **Project:** JP Wilson Financial (client site)
- **Status:** ACTIVE
- **Live URL:** https://www.jpwilsonfinancial.com
- **Deploy platform:** Vercel (project: `jpwilson-financial`)
- **Canonical source:** `~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/WEBSITES/jpwilson-financial/`
- **GitHub:** `git@github.com:carson937/jpwilson-financial.git`
- **Owner:** Carson (CAPS)
- **Client:** JP Wilson Financial
- **Stack:** Next.js + React + Tailwind
- **Last verified live:** 2026-07-04

## Integrations

| Integration | Status | Notes |
|---|---|---|
| Jotform lead form (ID `261496542238059`) | LIVE | Hardcoded, no env vars |
| Zapier lead automation | LIVE | Zap `#368000737` — Jotform → EZLynx |
| EZLynx Sales Center | BROKEN | 403 unauthorized — fix in progress |

## Forms status

- Lead capture form: LIVE and validated (per commit `daa844c: fix: complete lead pipeline — source tracking + form validation`)

## Known issues

- EZLynx Sales Center integration returning 403 unauthorized — under investigation with EZLynx
- Prior to 2026-07-04, project source was not GitHub-backed (fixed in Phase F)

## Rollback

```bash
# Vercel deploy rollback
cd ~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/WEBSITES/jpwilson-financial
bunx vercel promote <previous-deployment-url>

# Source rollback
git log --oneline
git reset --hard <sha>
git push --force-with-lease origin main    # only if remote must match reset
```

## Do not

- Do not deploy from any other folder — this is the single canonical source
- Do not rename `.vercel/` folder — that is the deploy link to Vercel project
- Do not commit `.env.local` or any file containing Jotform API keys / EZLynx creds

See `SOURCE_OF_TRUTH.md` for the full deploy + verification protocol.
