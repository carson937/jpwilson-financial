import { GO_RESPONSE_HEADERS, resolveGoLink } from '@/lib/caps-tracking/go'
import { GO_CONFIG, GO_REGISTRY } from '@/lib/go/registry'

/**
 * /go/<code> — short attribution link. A pure redirect:
 *   - records NOTHING (no tracker, no fetch, no cookie). Bots and link-preview crawlers hit redirects;
 *     a real visit starts when the destination page loads and CAPS tracking reads the params.
 *   - never cached, never indexed.
 *   - unknown/expired/invalid codes fall back to "/" with no attribution params.
 * Resolution + validation live in lib/caps-tracking/go.ts (vendored, tested in caps-tracking).
 */
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ code: string }> }

async function redirect(request: Request, ctx: Ctx): Promise<Response> {
  const { code } = await ctx.params
  const inbound = new URL(request.url).searchParams
  const result = resolveGoLink(GO_REGISTRY, GO_CONFIG, code, inbound)
  return new Response(null, { status: 302, headers: { ...GO_RESPONSE_HEADERS, Location: result.location } })
}

export const GET = redirect
export const HEAD = redirect
