/** @type {import('next').NextConfig} */

/**
 * Baseline security headers.
 *
 * A strict Content-Security-Policy is deliberately NOT set here. GA4, the Meta
 * Pixel, the inline JSON-LD block, and Next's own bootstrap scripts would all
 * need `script-src 'unsafe-inline'`, which strips most of the value while adding
 * real risk of silently breaking analytics in production. A nonce-based CSP is a
 * follow-up task with its own verification pass, not a launch-day change.
 */
const securityHeaders = [
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
