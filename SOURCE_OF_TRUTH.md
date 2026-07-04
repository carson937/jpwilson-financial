# SOURCE OF TRUTH — jpwilson-financial

**Canonical source for the JP Wilson Financial production website.**

- **Live URL:** https://www.jpwilsonfinancial.com (primary), https://jpwilsonfinancial.com (apex redirect)
- **Vercel project:** `jpwilson-financial` (org: `carson24wilson-3306s-projects`)
- **Vercel project ID:** `prj_4ZhE9c2KIms5bykgCqHlK1SKoghR`
- **Aliases:** `jpwilsonfinancial.com`, `jpwilson-financial.vercel.app`
- **Stack:** Next.js + React + Tailwind
- **Canonical path:** `~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/WEBSITES/jpwilson-financial/`
- **Client workspace:** `~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/CLIENT_PROJECTS/jp-wilson/`
- **Deploy platform:** Vercel (single-platform)
- **GitHub:** `git@github.com:carson937/jpwilson-financial.git`
- **Locked:** 2026-07-04

## Do not edit anywhere else.

This is the sole deploy-linked source folder. No fork, no duplicate.

## Deploy

```bash
cd ~/Desktop/AI-Hub/02_CAPS/05_FULFILLMENT/WEBSITES/jpwilson-financial
bunx vercel --prod
```

## Rollback

**Vercel:** prior deploys retained, promotable via:
```bash
bunx vercel promote <previous-deployment-url>
```

**Source:** GitHub remote at `carson937/jpwilson-financial` holds full commit history. `git reset --hard <sha>` restores any tracked state.

## Verification protocol

```bash
curl -sI https://www.jpwilsonfinancial.com
# Expected: HTTP/2 200
```

If unexpected behavior appears, cross-reference:
- Live HTML fingerprint vs local `app/page.tsx` output
- Vercel deploy ID (`bunx vercel ls`) vs last known good deploy

## Client-side integration notes

- **Jotform lead form:** ID `261496542238059` (hardcoded per `.env.example` — no server env vars required)
- **Zapier flow:** Zap `#368000737` — leads Jotform → EZLynx
- **EZLynx Sales Center:** ongoing fix in progress (403 unauthorized issue per `CLIENT_PROJECTS/_INDEX.md`)
