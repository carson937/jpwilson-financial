'use client'
import QuoteFunnel from '@/components/quote-experience/QuoteFunnel'
import { commercialFunnel } from '@/funnels/commercial'

export default function QuoteEntry() { return <QuoteFunnel product={commercialFunnel} /> }

