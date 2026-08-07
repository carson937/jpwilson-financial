'use client'

import QuoteFunnel from '@/components/quote-experience/QuoteFunnel'
import { lifeFunnel } from '@/funnels/life'

/**
 * Client entry for the Life funnel.
 *
 * The product config holds `toLead`, a function — and functions cannot cross
 * the server/client boundary as props. So the config is imported HERE, inside
 * the client bundle, instead of being handed down from the server page. That
 * keeps `page.tsx` a server component (which is what lets it export `metadata`)
 * and keeps the funnel config a single self-contained object.
 *
 * Each future product gets a file like this one: two imports, one line.
 */
export default function QuoteEntry() {
  return <QuoteFunnel product={lifeFunnel} />
}
