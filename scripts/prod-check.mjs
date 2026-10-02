#!/usr/bin/env node
/**
 * Lightweight production check (HTTP only, no browser, no form submits, no tracking events).
 *
 *   node scripts/prod-check.mjs https://www.jpwilsonfinancial.com
 *
 * - every public page returns 200
 * - every code in lib/go/links.json answers 302 (GET and HEAD) to its registered funnel path with the registered
 *   attribution, is no-store + noindex, sets no cookie, and the destination is 200 (no redirect loops)
 * - unknown code falls back to "/" with no params; robots disallows /go/
 * For the browser-level analytics checks (GA4 once, SDK present, no duplicates) run scripts/analytics-smoke.mjs.
 * Exit code 1 on any failure.
 */
import { readFileSync } from 'node:fs'

const base = (process.argv[2] ?? 'https://www.jpwilsonfinancial.com').replace(/\/$/, '')
const registry = JSON.parse(readFileSync(new URL('../lib/go/links.json', import.meta.url), 'utf8'))
const failures = []
const check = (ok, msg) => { if (!ok) failures.push(msg) }
const get = (path, init = {}) => fetch(base + path, { redirect: 'manual', ...init })

for (const path of ['/', '/privacy', '/terms', '/auto-insurance/quote', '/life-insurance/quote', '/business-insurance/quote', '/business-insurance']) {
  const res = await get(path)
  check(res.status === 200, `${path}: expected 200, got ${res.status}`)
}
for (const link of registry.links) {
  for (const method of ['GET', 'HEAD']) {
    const res = await get(`/go/${link.code}`, { method })
    const loc = res.headers.get('location') ?? ''
    check(res.status === 302, `/go/${link.code} ${method}: expected 302, got ${res.status}`)
    check(loc.startsWith(link.dest + '?'), `/go/${link.code} ${method}: location ${loc.slice(0, 60)} is not ${link.dest}`)
    check(new URL(loc, base).searchParams.get('utm_medium') === link.utm_medium, `/go/${link.code}: utm_medium not preserved`)
    check(new URL(loc, base).searchParams.get('post_id') === (link.post_id ?? null), `/go/${link.code}: post_id not preserved`)
    check(/no-store/.test(res.headers.get('cache-control') ?? ''), `/go/${link.code}: not no-store`)
    check(/noindex/.test(res.headers.get('x-robots-tag') ?? ''), `/go/${link.code}: not noindex`)
    check(!res.headers.get('set-cookie'), `/go/${link.code}: sets a cookie`)
  }
  const dest = await get(link.dest)
  check(dest.status === 200, `/go/${link.code}: destination ${link.dest} returned ${dest.status} (redirect loop or outage)`)
}
const miss = await get('/go/zz-not-a-code')
check(miss.status === 302 && miss.headers.get('location') === '/', 'unknown code must redirect to "/" with no params')
const robots = await (await get('/robots.txt')).text()
check(/Disallow:\s*\/go\//.test(robots), 'robots.txt must disallow /go/')

console.log(`checked ${registry.links.length} /go code(s) + 7 pages against ${base}`)
if (failures.length) { console.error(failures.map((f) => `FAIL ${f}`).join('\n')); process.exit(1) }
console.log('prod-check: ok')
