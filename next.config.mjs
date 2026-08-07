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
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com; img-src 'self' data: https://www.google-analytics.com https://www.facebook.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests",
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
