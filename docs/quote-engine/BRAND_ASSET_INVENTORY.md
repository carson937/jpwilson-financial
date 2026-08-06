# Brand Asset Inventory — JP Wilson Quote Engine

**Date:** 2026-08-06
**Scope:** Read-only audit. No assets created, edited, moved, renamed, or committed.
**Purpose:** Establish exactly which brand assets exist and which are approved for funnel mockups.
**Companion:** `QUOTE_ENGINE_DESIGN_HANDOFF.md` §1 — **see §6, two claims in that document are corrected here.**

---

## 0. Where I Looked

| Location | Result |
|---|---|
| `website/public/` | **8 assets found** — the entire usable set |
| `website/public/brand/` | 3 official lockups |
| `00_INBOX/` | **empty** |
| `01_CLIENT/` | **empty** |
| `03_WORK/` | **empty** |
| `04_ASSETS/` | **empty** |
| `05_OPERATIONS/` | **empty** |
| `06_RECORDS/` | **empty** |
| `07_ARCHIVE/` | **empty** |
| iCloud `Content /Dad vid/Dad logos/` | 7 files + `Bbb/` subtree — **a second, conflicting brand system** |
| iCloud `Dad logos/Bbb/` | 8 files — **none are JP Wilson assets** |

**Excluded by standing instruction:** the legacy Desktop/iCloud repository at
the legacy local copy of this site was **not accessed**, per the
directive never to read, edit, or compare against it. If the original `2026-07-29-official-logos`
intake delivery lives there, it remains unverified by this audit.

**Notable:** `BrandLogo.tsx` states the source of truth is *"the client's `2026-07-29-official-logos`
intake delivery, held in the operator's private client workspace (not in this repository)."*
**All eight client-workspace buckets are empty.** The curated originals are not where the code says
they are. The `public/brand/` copies are currently the only instance of that delivery I can verify.

---

## 1. Complete Asset Inventory

### 1.1 Official brand marks — `website/public/brand/`

| # | Filename | Path | Dimensions | Format | Transparent? | Quality | Recommended use |
|---|---|---|---|---|---|---|---|
| 1 | `jpw-lockup-horizontal.png` | `website/public/brand/` | 1231 × 373 | PNG | **No** — white baked in | High. Clean edges, correct proportions | **Funnel header / navbar.** Landing hero on light surface. Thank-you page header |
| 2 | `jpw-lockup-stacked.png` | `website/public/brand/` | 1090 × 970 | PNG | **No** — white baked in | High. Includes tagline *"INDEPENDENT ADVICE. STRONGER TOMORROWS."* | Large centered light-surface composition only. **Not** the compact header |
| 3 | `jpw-crest-tile.png` | `website/public/brand/` | 756 × 760 | PNG | **No** — white margin baked in | High. Rounded-square navy tile, gold lion-head shield + crown | **Dark-surface brand anchor.** Interstitial accent. Footer mark. Social profile image |

**Mark description (all three):** navy shield, gold crown, **realistic lion head in profile**, navy serif wordmark, gold rule, gold "FINANCIAL GROUP".

### 1.2 Photography — `website/public/`

| # | Filename | Path | Dimensions | Format | Transparent? | Quality | Recommended use |
|---|---|---|---|---|---|---|---|
| 4 | `patrick-wilson-headshot.png` | `website/public/` | 1024 × 1536 | PNG | **No** — see §6.1. Alpha channel exists but is **100% opaque**; corners are solid dark pixels | High. Well-lit, sharp, genuine portrait. Black turtleneck, glasses, warm smile, navy/maroon backdrop | **Named-advisor trust panel.** Interstitial reassurance screen. Thank-you page ("Patrick will call you"). Agent-led ad creative |

**This is the only photograph of Patrick Wilson in the workspace.** There is no alternate pose, no
alternate crop, no cutout version.

### 1.3 Metadata / platform icons — `website/public/`

| # | Filename | Path | Dimensions | Format | Transparent? | Quality | Recommended use |
|---|---|---|---|---|---|---|---|
| 5 | `og-image.png` | `website/public/` | 1200 × 630 | PNG | No | High. Stacked lockup + tagline, centered on white | **Social preview only.** Correct OG ratio. Not funnel content artwork |
| 6 | `icon-512.png` | `website/public/` | 512 × 512 | PNG | No | Good. Crest tile, slight edge softness at this raster size | App icon. **Not** content artwork |
| 7 | `apple-touch-icon.png` | `website/public/` | 180 × 180 | PNG | No | Good | iOS home-screen icon. **Not** content artwork |
| 8 | `favicon-32.png` | `website/public/` | 32 × 32 | PNG | No | Acceptable at intended size | Browser tab. **Not** content artwork |

### 1.4 Second brand system — iCloud `Dad logos/` — **CONFLICTING, NOT APPROVED**

These are genuine JP Wilson materials but use a **different lion**: a full-body **heraldic rampant
lion**, not the lion head in profile used on the live site.

| # | Filename | Dimensions | Format | Transparent? | Quality | Assessment |
|---|---|---|---|---|---|---|
| 9 | `3A2C63B6-…-F01DC.PNG` | 1536 × 1024 | PNG | **YES — genuinely transparent.** Corners RGBA (0,0,0,0); **92.5% fully transparent** | High. Horizontal lockup, rampant lion in crowned shield | **The only true transparent lockup master found anywhere.** Wrong mark — see §5.1 |
| 10 | `JPwilson Transparent.png` | 1024 × 1024 | PNG | **Partially.** Edges alpha=0, **67.8% transparent**, but a gold glow is baked into the visible area | Medium. Circular medallion seal, rampant lion | Despite the filename, **not a clean transparent master.** Glow cannot be removed without editing |
| 11 | `A541FB17-…-F35E77C.PNG` | 1536 × 1024 | PNG | No | High | Business-owner banner. Navy gradient, Charlotte skyline, rampant lion. Taglines: *"Protecting Business Owners. Reducing Risk. Strengthening Futures."* / *"We Compare. You Save."* |
| 12 | `A541FB17-…-F35E77C.jpg` | 1536 × 339 | JPG | No | High | Cropped banner variant of #11 |
| 13 | `7B6E9911-…-D453EA.JPG` | 1536 × 1024 | JPG | No | High | Business-card/banner. **Contains verifiable business facts — see §5.3** |

### 1.5 Not JP Wilson assets — exclude entirely

| Filename | Location | What it actually is |
|---|---|---|
| `IMG_5217.jpg` | `Dad logos/` | **Screenshot of a live Ethos competitor ad.** *"Don't be the dad without life insurance / My $2M policy is only $101/mo. with Ethos…"* with Ethos disclaimer `202510ETH-2999` |
| `IMG_5217 copy.jpg` | `Dad logos/Bbb/` | Duplicate of the above |
| `Sacred Roots - 2.PNG` | `Dad logos/` | Different brand entirely |
| `5240B21A-…-06C096.PNG` | `Dad logos/Bbb/Dad work /` | Circular headshot of an **unrelated woman**. Not Patrick, not JP Wilson staff |
| `IMG_5285–5289.PNG` | `Dad logos/Bbb/Dad work /Workspace /` | iPhone screenshots (1179×2556) of Instagram AI-prompt posts. Personal saves |
| `IMG_5301.jpg` | `Dad logos/Bbb/Dad work /Workspace /` | iPhone screenshot |

---

## 2. Recommended Primary Assets

| Role | Asset | Rationale |
|---|---|---|
| **Primary funnel logo** | `public/brand/jpw-lockup-horizontal.png` | Matches the live production identity; correct aspect ratio (3.3:1) for a compact mobile header; already the designated official mark in `BrandLogo.tsx`; consistent with `QUOTE_ENGINE_DESIGN_HANDOFF.md` §1 |
| **Secondary logo** | `public/brand/jpw-crest-tile.png` | The only mark that reads at small size and on dark surfaces. Use where the full lockup would be illegible — interstitials, favicon-scale moments, social profile |
| **Primary headshot** | `public/patrick-wilson-headshot.png` | Only Patrick photograph in existence in this workspace. High quality and genuinely usable |
| **Tertiary / large format** | `public/brand/jpw-lockup-stacked.png` | Only where a centered, large, light-surface lockup is wanted and the tagline is desired |
| **Recommended hero image** | **NONE — none exists.** See §3 | No lifestyle, family, office, or team photography exists anywhere in the workspace |

---

## 3. Missing Assets

Ordered by impact on the funnel.

| # | Missing | Impact | Severity |
|---|---|---|---|
| 1 | **Reversed / transparent lockup master (lion-head system)** | Every approved lockup has white baked in and a dark-navy wordmark. On any navy surface the artwork must sit on a white plate. Already documented as a KNOWN GAP in `BrandLogo.tsx` | **High** |
| 2 | **Carrier logos** | `CarrierLogos.tsx` contains **zero logo images** — it is a text marquee of coverage types. Both prior research documents identify carrier logos as JP's single strongest available trust asset (proof of independence). Nothing exists to render | **High** |
| 3 | **Lifestyle / family photography** | The funnel has no approved hero, background, or emotional imagery. Every observed competitor uses family or lifestyle imagery | **High** |
| 4 | **Office photo (Charlotte, 1200 The Plaza)** | Local-agent positioning is JP's core differentiator. A real office photo is the cheapest proof of physical presence | **Medium** |
| 5 | **Team photo** | Only relevant if JP is presented as more than a solo agent | Low |
| 6 | **Alternate Patrick poses / crops** | One portrait limits creative variation across ad formats and funnel screens | **Medium** |
| 7 | **Vector masters (SVG/AI/EPS)** | Every asset is raster. No scalable master exists for large-format or print | **Medium** |
| 8 | **Square + vertical logo crops for Meta placements** | Story/Reels 9:16 and 1:1 feed placements need dedicated safe-zone-aware crops | **Medium** |
| 9 | **Google review screenshot / verified rating asset** | Named as a primary trust element in the blueprint; no asset exists | **Medium** |
| 10 | **Signature / handwritten mark** | Optional warmth device for the thank-you page | Low |

---

## 4. Assets That Should NOT Be Used

| Asset | Reason |
|---|---|
| `IMG_5217.jpg` / `IMG_5217 copy.jpg` | **Competitor advertising material (Ethos), including their legal disclaimer.** Using or adapting it would be brand and legal exposure. Reference only — never an asset |
| Everything under `Dad logos/Bbb/` | Unrelated: a stranger's headshot, personal Instagram screenshots |
| `Sacred Roots - 2.PNG` | Different brand |
| `JPwilson Transparent.png` | Misleading filename. Baked-in gold glow; also the conflicting mark (§5.1) |
| The four rampant-lion files (#9, #11, #12, #13) | **Conflicting brand mark** — do not mix with the live lion-head system until the client rules (§5.1) |
| `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png` | Platform icons. Never place as content artwork |
| `og-image.png` | Metadata asset. Not a funnel visual treatment |
| Any recolored, traced, redrawn, or AI-regenerated version of any mark | Explicitly prohibited by `BrandLogo.tsx`: *"Never redraw, trace, recolour, crop, stretch, or regenerate them."* A hand-drawn SVG stand-in was already removed on 2026-07-30 and must not return |

---

## 5. Issues Requiring a Client Decision

### 5.1 Two conflicting lion marks are in circulation — **blocking for brand consistency, not for mockups**

| System | Mark | Where it lives | Transparent master? |
|---|---|---|---|
| **A — Lion head in profile** | Realistic lion head, navy shield, gold crown | Live website, `public/brand/`, all icons, OG image | **No** |
| **B — Heraldic rampant lion** | Full-body lion standing rampant | iCloud `Dad logos/`, business card, business-owner banner, medallion seal | **Yes** (#9) |

**These are not variants of one another. They are different logos.**

The irony worth surfacing: the documented KNOWN GAP is the absence of a transparent master —
and a genuinely transparent, 92.5%-alpha horizontal lockup **does exist** (#9), but it belongs to
the wrong system. It cannot be used with System A.

**Recommendation:** proceed with **System A** for V1 mockups, because it is the live production
identity and is what the code and design handoff already designate. Flag System B to the client and
ask which mark is canonical going forward. **Do not mix them in a single composition.**

### 5.2 Three taglines are in circulation

- *"Independent Advice. Stronger Tomorrows."* — stacked lockup + OG image (System A)
- *"We Compare. You Save."* — business-owner banner (System B)
- *"Protecting Business Owners. Reducing Risk. Strengthening Futures."* — business-owner banner (System B)

Only the first is attached to the approved System A artwork. Use it; confirm the others with the client.

### 5.3 Business facts recoverable from the business-card asset (#13)

Not brand *assets*, but verifiable facts useful to the funnel — **all require client confirmation
before publication:**

- Legal entity: **J P Wilson Financial Group, LLC**
- Website: `www.jpwilsonfinancial.com`
- Toll free: **(866) 786-1585**
- Social handle: **@jpwilsonfinancial**
- Product lines listed: Auto · Business · Commercial Auto · Life · Health · Disability · General Liability · Workers Comp

The product list independently corroborates the multi-product roadmap in the blueprint (§9).

---

## 6. Corrections to `QUOTE_ENGINE_DESIGN_HANDOFF.md` §1

Two claims in the existing handoff do not survive verification.

### 6.1 The headshot is **not** transparent

> Handoff states: *"Patrick Wilson portrait … 1024 × 1536 px **with transparency**"*

**Verified false.** The PNG carries an alpha channel, but decoding it shows:
- All four corners are **fully opaque** — RGBA (4,6,9,**255**), (48,18,27,**255**), (7,11,13,**255**), (6,11,13,**255**)
- **0.0%** of sampled pixels are transparent

It is a normal rectangular photograph with a visible navy/maroon studio backdrop. **Designers must
not plan on dropping it onto arbitrary backgrounds.** Either use it in a defined frame/crop, or
commission a proper cutout.

### 6.2 "No approved transparent or reversed lockup master" — true for System A, but incomplete

The handoff's logo surface rule is correct **for the marks it governs**. It does not note that a
fully transparent lockup exists in the client's iCloud folder under the *other* brand system (§5.1).
That does not change the rule for V1 — it changes what to ask the client for.

---

## 7. Mockup-Ready Verdict

### **YES — proceed with mockups, with three constraints.**

**Sufficient to build every screen in the design handoff:**
- Primary logo for the funnel header ✅
- Crest for dark surfaces and interstitials ✅
- Real Patrick portrait for the named-advisor trust panel ✅ — the single most important asset for
  the local-agent positioning identified as JP's core differentiator
- Correct social preview asset ✅

**Constraints the design team must work inside:**

1. **No dark-surface lockup.** On navy, use the crest tile or place the horizontal lockup on a
   deliberate white plate. Never recolor the wordmark.
2. **No carrier logos, no lifestyle photography, no office photo.** Mockups must either use
   typographic/color treatments in those slots or explicitly mark them as
   `PLACEHOLDER — ASSET NOT SUPPLIED`. Do not fill them with stock imagery presented as real, and do
   not invent carrier marks.
3. **The headshot is not a cutout.** Design around a rectangular photo.

**Not blocking V1 mockups, but must be resolved before production launch:** the System A / System B
mark conflict (§5.1), the missing reversed master, and the absent carrier logos.

---

## 8. Verification Method

- File discovery: recursive `find` across the full client tree, excluding `node_modules`, `.next`, `.git`
- Dimensions / format / alpha flag: `sips`
- **True per-pixel transparency:** custom PNG decoder (zlib inflate + PNG filter reconstruction),
  sampling corner RGBA and counting fully-transparent pixels on a 4px grid. Used because `hasAlpha`
  reports only channel *presence*, which is what produced the incorrect claim in §6.1
- Visual identification: every candidate asset was opened and viewed. No asset was classified from
  its filename alone — which is how the Ethos competitor screenshot and the unrelated headshot were caught
- Code cross-reference: `BrandLogo.tsx`, `AboutPatrick.tsx`, `layout.tsx`, `CarrierLogos.tsx`

**No file was created, modified, moved, renamed, or committed. No graphics were generated.**
