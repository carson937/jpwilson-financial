'use client'
import QuoteFunnel from '@/components/quote-experience/QuoteFunnel'
import { autoFunnel } from '@/funnels/auto'
export default function QuoteEntry() { return <QuoteFunnel product={autoFunnel} /> }
