import { NextRequest, NextResponse } from 'next/server'
import { parseBrowserEvent } from '@/lib/quote-experience/telemetry'
import { forwardAutoEvent } from '@/lib/quote-experience/telemetry-server'

const counters = new Map<string, { count: number; expires: number }>()

export async function POST(req: NextRequest) {
  const respond = (status: number) => NextResponse.json({ recorded: status === 202 }, { status, headers: { 'Cache-Control': 'no-store' } })
  if (req.headers.get('origin') !== req.nextUrl.origin) return respond(403)
  if (req.headers.get('content-type')?.split(';')[0] !== 'application/json') return respond(415)
  if (Number(req.headers.get('content-length')) > 2048) return respond(413)
  const key = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const now = Date.now()
  if (counters.size >= 2000) counters.clear()
  const current = counters.get(key)
  if (current && current.expires > now) { if (++current.count > 100) return respond(429) }
  else counters.set(key, { count: 1, expires: now + 60_000 })
  const raw = await req.text()
  if (new TextEncoder().encode(raw).length > 2048) return respond(413)
  let data: unknown
  try { data = JSON.parse(raw) } catch { return respond(400) }
  const event = parseBrowserEvent(data)
  if (!event) return respond(400)
  return respond(await forwardAutoEvent(event) ? 202 : 503)
}

