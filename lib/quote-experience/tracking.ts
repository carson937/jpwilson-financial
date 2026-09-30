import type { QuoteProduct } from './types'

/**
 * Funnel analytics now flow through the shared CAPS tracker via `useFunnelTelemetry`
 * (components/quote-experience/useAutoTelemetry.ts). This module keeps only the
 * product-safe, non-PII vocabulary QuoteFunnel uses; there is no answer-carrying path.
 */
export function funnelIdFor(product: QuoteProduct): string {
  return product.id === 'commercial' ? 'commercial' : product.id
}
