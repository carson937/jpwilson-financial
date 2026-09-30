/** @type {import('next').NextConfig} */

/**
 * Baseline security headers.
 *
 * This is a compatibility CSP rather than a nonce-based strict CSP: Next's App
 * Router bootstrap and the optional analytics integrations use inline scripts.
 * It still confines every other resource type, blocks framing, and prevents the
 * browser from reaching arbitrary third-party endpoints. A future nonce rollout
 * must be verified against the optional analytics before removing unsafe-inline.
 */
/**
 * `upgrade-insecure-requests` is correct for the deployed HTTPS site, but it
 * makes Safari/WebKit rewrite every same-origin subresource request (fonts,
 * images, JS chunks) to `https://`, which fails outright against a plain-HTTP
 * local server ("A TLS error caused the secure connection to fail" — the page
 * looks broken because nothing but the initial HTML loads). Chromium does not
 * enforce this the same way locally, so the break is Safari-specific.
 *
 * `LOCAL_PREVIEW_HTTP=1` drops only that one directive for a local `next
 * start`/`next dev` run. It is never set in the deployed environment, so
 * production's CSP is byte-for-byte unchanged.
 */
const dropHttpsUpgrade = process.env.LOCAL_PREVIEW_HTTP === '1'

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
      "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.facebook.com",
      "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.facebook.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "media-src 'self'",
      "worker-src 'self' blob:",
      ...(dropHttpsUpgrade ? [] : ['upgrade-insecure-requests']),
    ].join('; '),
  },
  // Stop MIME sniffing turning a served asset into script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // No framing: nothing here is meant to be embedded.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Send the origin cross-site, full path same-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The site asks for none of these; deny them explicitly.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // Vercel also sets HSTS at the edge; declaring it keeps the guarantee if the
  // host ever changes. No `preload` — that is a deliberate, hard-to-undo opt-in.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig = {
  reactStrictMode: true,

  // Don't advertise the framework and version to scanners.
  poweredByHeader: false,

  // No remote images are used anywhere in this project. The previous
  // `images.remotePatterns` entry for images.unsplash.com was leftover template
  // config, and an unused remote pattern is live attack surface for the Image
  // Optimizer advisories (e.g. GHSA-9g9p-9gw9-jx7f). Every image is local, so
  // the allowlist stays absent.

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
