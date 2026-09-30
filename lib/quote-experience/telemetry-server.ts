import { createHmac } from 'node:crypto'
import type { FunnelTelemetry } from './telemetry'

/** No raw request, answers or lead object may cross this interface. */
export async function forwardAutoEvent(event: FunnelTelemetry): Promise<boolean> {
  const secret = process.env.JP_FUNNEL_TELEMETRY_SECRET ?? process.env.JP_AUTO_TELEMETRY_SECRET
  const configured = process.env.JP_FUNNEL_TELEMETRY_URL ?? process.env.JP_AUTO_TELEMETRY_URL
  if (!secret || !configured) return false
  let url: URL
  try { url = new URL(configured) } catch { return false }
  if (url.protocol !== 'https:') return false
  const body = JSON.stringify(event)
  const timestamp = String(Date.now())
  const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  try {
    const result = await fetch(url, { method: 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json', 'x-caps-ingestion-key': 'jp-auto-v1', 'x-caps-timestamp': timestamp, 'x-caps-signature': signature },
      body, signal: AbortSignal.timeout(2500),
    })
    if (!result.ok) console.warn(JSON.stringify({ scope: 'auto-telemetry', status: result.status, eventId: event.eventId }))
    return result.ok
  } catch {
    console.warn(JSON.stringify({ scope: 'auto-telemetry', status: 'unavailable', eventId: event.eventId }))
    return false
  }
}
