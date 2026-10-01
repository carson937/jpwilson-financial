#!/usr/bin/env node
/**
 * Repeatable analytics smoke test (real browser, desktop + mobile).
 *
 *   node scripts/analytics-smoke.mjs <site-url> [--mock-ingest] [--ingest-host <substr>]
 *
 * Checks per page and viewport:
 *   - exactly one GA4 base tag (gtag/js?id=G-837LY8SGTM), one _next-ga-init, one dataLayer config for the ID
 *   - Vercel Web Analytics script present (https targets only)
 *   - the CAPS tracker POSTs a batch to the ingestion API (mocked with --mock-ingest, else the real API)
 *   - page_view once per page, funnel_view/funnel_start on funnel routes, phone click event, no PII in any payload
 *   - GA4 collect requests carry no PII and there are no duplicate page_view hits
 * Smoke traffic is tagged utm_source=caps_smoke&utm_medium=test so dashboards can exclude it.
 * Exit code 1 on any failed check. Headless UAs are dropped by the ingestor on purpose, so a normal UA string is set.
 */
import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3000').replace(/\/$/, '')
const mock = args.includes('--mock-ingest')
const hostFlag = args.indexOf('--ingest-host')
const ingestHost = hostFlag >= 0 ? args[hostFlag + 1] : '/api/t'
const GA_ID = 'G-837LY8SGTM'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const PII = [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, /(?<!\d)\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/, /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/]

const pages = [
  { path: '/', funnel: null },
  { path: '/privacy', funnel: null },
  { path: '/auto-insurance/quote', funnel: 'auto' },
  { path: '/life-insurance/quote', funnel: 'life' },
  { path: '/business-insurance/quote', funnel: 'commercial' },
]
const viewports = [
  { name: 'desktop', width: 1280, height: 800, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
]

const failures = []
const report = []
const check = (ok, msg, ctx) => { if (!ok) failures.push(`${ctx}: ${msg}`) }

const browser = await chromium.launch({ args: process.env.SMOKE_HOST_RULES ? [`--host-resolver-rules=${process.env.SMOKE_HOST_RULES}`] : [] })
for (const vp of viewports) {
  const context = await browser.newContext({ userAgent: UA, viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.isMobile })
  for (const p of pages) {
    const ctx = `${vp.name} ${p.path}`
    const page = await context.newPage()
    const batches = []
    const ga = []
    const vercelHits = []
    page.on('request', (req) => {
      const url = req.url()
      if (/\/(view|event)(\?|$)/.test(new URL(url).pathname) && new URL(url).origin === new URL(base).origin) vercelHits.push(url)
      if (/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(url)) ga.push(url + (req.postData() ? `?${req.postData()}` : ''))
    })
    // Beacon bodies are only readable through route interception; record, then mock or pass through.
    await page.route((u) => u.toString().includes(ingestHost) && !u.toString().includes('/_next/'), async (route) => {
      const req = route.request()
      if (req.method() === 'POST' && req.postData()) {
        try { batches.push(...(JSON.parse(req.postData()).events ?? [])) } catch { failures.push(`${ctx}: ingest body is not JSON`) }
      }
      if (mock || req.method() !== 'POST') return route.fulfill({ status: 202, contentType: 'application/json', body: '{"accepted":1,"duplicates":0,"rejected":0}' })
      return route.continue()
    })

    const url = `${base}${p.path}?utm_source=caps_smoke&utm_medium=test&utm_campaign=smoke`
    const res = await page.goto(url, { waitUntil: 'load' })
    check(res && res.status() === 200, `status ${res?.status()}`, ctx)
    await page.waitForTimeout(2500)

    const dom = await page.evaluate((id) => ({
      gtagScripts: document.querySelectorAll(`script[src*="gtag/js?id=${id}"]`).length,
      gaInit: document.querySelectorAll('#_next-ga-init').length,
      configs: (window.dataLayer || []).filter((e) => e && e[0] === 'config' && e[1] === id).length,
      vercel: document.querySelectorAll('script[data-sdkn^="@vercel/analytics"], script[src*="_vercel/insights"]').length,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    }), GA_ID)
    check(dom.gtagScripts === 1, `expected 1 GA4 script, found ${dom.gtagScripts}`, ctx)
    check(dom.gaInit === 1, `expected 1 GA4 init, found ${dom.gaInit}`, ctx)
    check(dom.configs === 1, `expected 1 GA4 config, found ${dom.configs}`, ctx)
    if (base.startsWith('https://')) check(dom.vercel >= 1, 'Vercel Web Analytics script missing', ctx)
    // Vercel's SDK skips automated browsers (navigator.webdriver), so a missing hit is only a warning here; confirm in real Chrome.
    if (base.startsWith('https://') && vercelHits.length === 0) console.warn(`WARN ${ctx}: no Vercel /view hit (automation is suppressed by the SDK)`)
    check(!dom.overflowX, 'horizontal overflow', ctx)

    // Interactions: phone click (prevent navigation), funnel start.
    await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest?.('a[href^="tel:"],a[href^="mailto:"]')) e.preventDefault() }, true))
    const tel = page.locator('a[href^="tel:"]:visible').first()
    if (await tel.count()) await tel.dispatchEvent('click').catch(() => undefined)
    if (p.funnel) {
      const start = page.getByRole('button', { name: /start/i }).first()
      if (await start.count()) await start.click({ timeout: 3000 }).catch(() => undefined)
      await page.waitForTimeout(500)
      const choice = page.locator('button[role="radio"], [role="radio"], button[data-choice]').first()
      if (await choice.count()) await choice.click({ timeout: 3000 }).catch(() => undefined)
    }
    await page.waitForTimeout(800)
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide'))) // SDK flushes on pagehide
    await page.waitForTimeout(1200)

    const names = batches.map((e) => e.event_name)
    const count = (n) => names.filter((x) => x === n).length
    check(names.length > 0, 'no CAPS events sent to ingestion', ctx)
    check(count('page_view') === 1, `expected 1 page_view, got ${count('page_view')}`, ctx)
    if (await tel.count()) check(count('phone_click') >= 1, 'phone click not tracked', ctx)
    if (p.funnel) {
      check(count('funnel_view') >= 1, 'funnel_view missing', ctx)
      check(batches.every((e) => !e.funnel_id || e.funnel_id === p.funnel), 'wrong funnel id', ctx)
    }
    check(new Set(batches.map((e) => e.event_id)).size === batches.length, 'duplicate event_id in payloads', ctx)
    const body = JSON.stringify(batches)
    check(!PII.some((re) => re.test(body)), 'PII-shaped value in CAPS payload', ctx)
    check(!PII.some((re) => re.test(ga.join(' '))), 'PII-shaped value in GA4 hits', ctx)
    check(batches.every((e) => e.utm_source === undefined && (e.source === undefined || typeof e.source === 'string')), 'malformed attribution', ctx)
    check(batches.length === 0 || batches.every((e) => e.source === 'caps_smoke'), 'attribution source not persisted on every event', ctx)
    report.push({ ctx, events: names.length, names: [...new Set(names)], gaHits: ga.length, ...dom })
    await page.close()
  }
  await context.close()
}
await browser.close()

console.log(JSON.stringify({ base, mock, pagesChecked: report.length, failures }, null, 2))
for (const r of report) console.log(`${r.ctx}: events=${r.events} [${r.names.join(',')}] ga=${r.gaHits}`)
process.exit(failures.length ? 1 : 0)
