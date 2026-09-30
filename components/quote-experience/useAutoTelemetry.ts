'use client'
import { useCallback, useEffect, useRef } from 'react'
import { captureAttribution, captureEventAttribution, detectDeviceClass, sendFunnelEvent, sourceBucket, type DeviceClass, type FunnelEvent, type FunnelTelemetry, type TrafficSource } from '@/lib/quote-experience/telemetry'
import type { LeadPayload } from '@/lib/leadValidation'

export function useFunnelTelemetry(funnelId: FunnelTelemetry['funnelId'], funnelVersion: string, stepId: string | undefined, done: boolean, enabled = true) {
  const identity = useRef<{
    sessionId: string; source: TrafficSource; device: DeviceClass
    attribution: Partial<LeadPayload>
    eventAttribution: ReturnType<typeof captureEventAttribution>
  } | null>(null)
  const lastView = useRef('')
  const emit = useCallback((event: FunnelEvent, extra: Partial<Pick<FunnelTelemetry, 'step' | 'requestId'>> = {}) => {
    if (!enabled || !identity.current) return
    sendFunnelEvent({
      sessionId: identity.current.sessionId, source: identity.current.source, device: identity.current.device,
      funnelId, funnelVersion, event, eventId: crypto.randomUUID(), occurredAt: new Date().toISOString(),
      ...identity.current.eventAttribution, ...extra,
    })
  }, [enabled, funnelId, funnelVersion])

  useEffect(() => {
    if (!enabled) return
    if (!identity.current) {
      identity.current = {
        sessionId: crypto.randomUUID(), source: sourceBucket(window.location.search, document.referrer), device: detectDeviceClass(),
        attribution: captureAttribution(window.location.search, document.referrer),
        eventAttribution: captureEventAttribution(window.location.search),
      }
      emit('funnel_view')
    }
    const key = done ? 'done' : stepId ?? 'intro'
    if (lastView.current === key) return
    lastView.current = key
    if (!done && stepId) emit('step_view', { step: stepId })
  }, [enabled, emit, stepId, done])

  useEffect(() => {
    if (!enabled || done || !stepId) return
    const exit = () => emit('step_dropoff', { step: stepId })
    window.addEventListener('pagehide', exit)
    return () => window.removeEventListener('pagehide', exit)
  }, [enabled, done, stepId, emit])
  return { emit, identity }
}

export const useAutoTelemetry = (enabled: boolean, stepId: string | undefined, done: boolean) => useFunnelTelemetry('auto', '1.0.0', stepId, done, enabled)
