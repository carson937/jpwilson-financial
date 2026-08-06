# AGENTS.md — jpwilson-financial

Instructions for any AI coding agent in this repo. Doctrine lives here; harness files hold
harness quirks only.

**This repository is public.** Never add credentials, tokens, internal filesystem paths,
private infrastructure detail, or non-public client information to any file here — including
this one.

## What this is

Production marketing website for a financial services practice. Next.js App Router + React +
Tailwind, deployed to Vercel. This is a **client site, not an internal tool**: no dashboard
chrome, no card grids, no SaaS template structure.

## Commands — package manager is `npm`

`package-lock.json` is the lockfile. Do not introduce pnpm, yarn, or bun. Do not delete or
regenerate the lockfile.

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev | `npm run dev` |
| Build | `npm run build` |
| Start (prod local) | `npm run start` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |

There is no test suite. Do not claim tests passed. Do not add a test framework as a side
effect of an unrelated task.

## Authority

`SOURCE_OF_TRUTH.md` and `STATUS.md` are locked operational records — deploy target,
rollback, current state. Read them; propose changes rather than silently editing them.
`PRODUCT.md` and `docs/` describe the product decisions.

## Regulated-industry content rules

This site markets financial services. **Never invent or placeholder** a credential, license,
registration, disclosure, performance figure, testimonial, review, rating, statistic, years
in practice, or any guarantee. A fabricated claim here is a compliance problem for the
client, not a TODO. If a fact has no client-supplied source, leave the section out and say
what is missing.

## Accessibility

WCAG 2.2 AA: semantic HTML before ARIA · every interactive element keyboard-reachable ·
focus always visible · real `<label>` on every control · 4.5:1 body contrast · never meaning
by color alone · `prefers-reduced-motion` honored.

## Do not touch

| Path | Why |
|---|---|
| `public/**` client-supplied imagery | Cannot be regenerated |
| `package-lock.json` | Only via `npm`. Never hand-edited. |
| Any legal, disclosure, or compliance copy | Requires client review |

## Stop and ask

Production deploy · DNS · domain or hosting changes · repository visibility · credentials ·
force push, history rewrite, or any push to `main` (this repo is deploy-linked — a push can
reach production) · any regulated claim without a client-supplied source.

## Verification

| Claim | Requires |
|---|---|
| "Builds" | `npm run build` exited 0 |
| "Typechecks" | `npm run typecheck` exited 0 |
| "Lints" | `npm run lint` exited 0 |
| "Visually verified" | the rendered route was actually looked at |

Never claim a higher row than you performed. State what you did not verify.
