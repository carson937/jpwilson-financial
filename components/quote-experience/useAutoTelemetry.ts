'use client'
import { useCallback, useEffect, useRef } from 'react'
import { AUTO_STEPS, sendAutoEvent, sourceBucket, type AutoSource, type AutoEvent, type AutoTelemetry } from '@/lib/quote-experience/telemetry'

export function useAutoTelemetry(enabled: boolean, stepId: string | undefined, done: boolean) {
  const identity = useRef<{ sessionId: string; source: AutoSource } | null>(null)
  const lastView = useRef('')
  const emit = useCallback((event: AutoEvent, extra: Partial<Pick<AutoTelemetry, 'step' | 'requestId'>> = {}) => {
    if (!enabled || !identity.current) return
    sendAutoEvent({ ...identity.current, event, eventId: crypto.randomUUID(), occurredAt: new Date().toISOString(), ...extra })
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    if (!identity.current) {
      identity.current = { sessionId: crypto.randomUUID(), source: sourceBucket(window.location.search, document.referrer) }
      emit('funnel_view')
    }
    const key = done ? 'done' : stepId ?? 'intro'
    if (lastView.current === key) return
    lastView.current = key
    if (!done && stepId && (AUTO_STEPS as readonly string[]).includes(stepId)) emit('step_view', { step: stepId as AutoTelemetry['step'] })
  }, [enabled, emit, stepId, done])

  useEffect(() => {
    if (!enabled || done || !stepId) return
    const exit = () => emit('funnel_exit', { step: stepId as AutoTelemetry['step'] })
    window.addEventListener('pagehide', exit)
    return () => window.removeEventListener('pagehide', exit)
  }, [enabled, done, stepId, emit])

  return { emit, identity }
}
