# SOURCE OF TRUTH — jpwilson-financial

**Canonical source for the JP Wilson Financial production website.**

> This repository is public. Deploy identifiers, org slugs, dashboard links, and local
> filesystem paths belong in the Vercel dashboard and the operator's private records — not
> in this file. Everything below is what a developer needs to build, deploy, and roll back.

- **Live URL:** https://www.jpwilsonfinancial.com (primary), https://jpwilsonfinancial.com (apex redirect)
- **Stack:** Next.js + React + Tailwind
- **Package manager:** `npm` (`package-lock.json`)
- **Deploy platform:** Vercel (single-platform). The Vercel project name matches this repository.
- **Repository:** this repo is the sole deploy-linked source. No fork, no duplicate.
- **Locked:** 2026-07-04
- **Source recovered and relocated:** 2026-07-30 (see repository history)

## Do not edit anywhere else

Work from a clone of this repository. If you find a second copy of this site on a local
disk, it is stale — do not read from it, edit it, or deploy it. This repository is the only
source of truth.

## Deploy

Run from the repository root:

```bash
bunx vercel --prod
```

Vercel resolves the project from the linked `.vercel` directory, which is gitignored and
created by `bunx vercel link`. If the project is not linked, link it once from the Vercel
dashboard rather than hardcoding identifiers here.

## Rollback

**Vercel:** prior deploys are retained and promotable.

```bash
bunx vercel ls                                  # list deployments
bunx vercel promote <previous-deployment-url>   # promote a known-good one
```

**Source:** the GitHub remote holds full commit history. `git reset --hard <sha>` restores
any tracked state.

## Verification protocol

```bash
curl -sI https://www.jpwilsonfinancial.com
# Expected: HTTP/2 200
```

If unexpected behavior appears, cross-reference:

- live HTML fingerprint vs local `app/page.tsx` output
- current Vercel deploy (`bunx vercel ls`) vs the last known good deploy

## Client-side integration notes

- **Jotform lead form** — embedded client-side. The form ID lives in `.env.example` and
  `app/api/submit-lead/route.ts`; no server env vars are required.
- **Lead automation** — submissions route from Jotform into the client's CRM via a Zapier
  workflow. The workflow is configured in Zapier, not in this repository. If lead delivery
  breaks, the failure is in that workflow, not in the site build.
- **CRM delivery** — end-to-end delivery into the client's CRM has been confirmed in
  testing. One controlled live production test remains outstanding after deployment.
