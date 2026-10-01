import { track as vercelTrack } from '@vercel/analytics'
import { createTracker, type Env, type Tracker } from '@/lib/caps-tracking/client'
import type { ClientTrackingConfig } from '@/lib/caps-tracking/config'
import type { DeviceClass } from '@/lib/caps-tracking/schema'
import jpConfig from '@/lib/caps-tracking/jp-wilson.json'

/**
 * The single CAPS tracker for this site. Everything (page views, link clicks, funnels,
 * legacy trackEvent callers) goes through it, so there is exactly one event pipeline:
 * tracker -> { CAPS ingestion, GA4, Vercel custom events }.
 */
const config: ClientTrackingConfig = {
  ...(jpConfig as ClientTrackingConfig),
  ingest_endpoint: process.env.NEXT_PUBLIC_CAPS_INGEST_URL || (jpConfig as ClientTrackingConfig).ingest_endpoint,
}

/** crypto.randomUUID needs a secure context; fall back to getRandomValues so tracking never silently dies. */
function randomId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6]! & 0x0f) | 0x40
  b[8] = (b[8]! & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

const BOT_UA = /bot|crawl|spider|headless|lighthouse|prerender/i

function browserEnv(): Env {
  return {
    now: () => Date.now(),
    random: randomId,
    storage: window.localStorage,
    sessionStorage: window.sessionStorage,
    get location() {
      return { href: window.location.href, pathname: window.location.pathname }
    },
    get referrer() {
      return document.referrer
    },
    send(url, body) {
      // text/plain keeps this a CORS "simple" request (no preflight) and lets sendBeacon survive unload.
      if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) return
      void fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, mode: 'cors' }).catch(() => undefined)
    },
    gtag: (...args) => window.gtag?.(...args),
    vercelTrack: (name, props) => vercelTrack(name, props),
    deviceClass: (): DeviceClass => {
      if (!window.matchMedia) return 'unknown'
      if (window.matchMedia('(max-width: 640px)').matches) return 'mobile'
      return window.matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop'
    },
    isBot: () => BOT_UA.test(navigator.userAgent),
  }
}

let instance: Tracker | null = null

/** Browser-only; returns null during SSR. */
export function getTracker(): Tracker | null {
  if (typeof window === 'undefined') return null
  if (!instance) {
    try {
      instance = createTracker(config, browserEnv())
    } catch (error) {
      console.warn('[caps-tracking] tracker init failed', error)
      return null
    }
  }
  return instance
}
