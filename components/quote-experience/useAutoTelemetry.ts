'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { FunnelTracker } from '@/lib/caps-tracking/client'
import { getTracker } from '@/lib/tracker'
import { captureAttribution, sourceBucket, type TrafficSource } from '@/lib/quote-experience/telemetry'
import type { LeadPayload } from '@/lib/leadValidation'

/**
 * Funnel instrumentation for the quote experiences (auto / life / commercial), now a thin layer over the
 * shared CAPS tracker. `emit` keeps the event vocabulary QuoteFunnel already uses, but every call lands in
 * the one tracker (CAPS ingestion + GA4 + Vercel); nothing here talks to the network itself.
 * Only funnel and step ids ever leave the page, never answers.
 */
export type FunnelEmit =
  | 'funnel_view' | 'funnel_start' | 'step_view' | 'step_answer' | 'step_dropoff' | 'step_back'
  | 'validation_error' | 'contact_capture' | 'submit_attempt' | 'booking_click'

export function useFunnelTelemetry(funnelId: string, _funnelVersion: string, stepId: string | undefined, done: boolean, enabled = true) {
  const funnel = useRef<FunnelTracker | null>(null)
  const booted = useRef(false)
  const lastView = useRef('')
  const leadId = useRef<string | null>(null)
  /** Session + attribution that ride on the CRM lead payload (not analytics events), so a lead can be joined to its session. */
  const identity = useRef<{ sessionId: string; source: TrafficSource; attribution: Partial<LeadPayload> } | null>(null)

  const get = useCallback((): FunnelTracker | null => {
    if (!enabled) return null
    if (!funnel.current) {
      try { funnel.current = getTracker()?.funnel(funnelId) ?? null } catch { funnel.current = null }
    }
    return funnel.current
  }, [enabled, funnelId])

  const emit = useCallback((event: FunnelEmit, extra: { step?: string; requestId?: string } = {}) => {
    const f = get()
    if (!f) return
    switch (event) {
      case 'funnel_view': return f.view()
      case 'funnel_start': return f.start()
      case 'step_view': return extra.step ? f.stepView(extra.step) : undefined
      case 'step_answer': return extra.step ? f.stepComplete(extra.step) : undefined
      case 'step_back': return extra.step ? f.back(extra.step) : undefined
      case 'step_dropoff': return f.abandon()
      case 'submit_attempt': {
        const tracker = getTracker()
        if (tracker) leadId.current = tracker.leadSubmit(funnelId)
        return
      }
      case 'booking_click': return getTracker()?.ctaClick('booking', `${funnelId}_thank_you`)
      default: return // validation_error / contact_capture: no CAPS event (noise; step_answer carries progress)
    }
  }, [get, funnelId])

  useEffect(() => {
    if (!enabled) return
    if (!booted.current) {
      booted.current = true
      identity.current = {
        // CAPS session ids are 's_<uuid>'; the lead API requires the bare UUID (joins back via 's_' + sessionId).
        sessionId: getTracker()?.ids().session.replace(/^s_/, '') ?? crypto.randomUUID(),
        source: sourceBucket(window.location.search, document.referrer),
        attribution: captureAttribution(window.location.search, document.referrer),
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
    const exit = () => { emit('step_dropoff'); getTracker()?.flush() }
    window.addEventListener('pagehide', exit)
    return () => window.removeEventListener('pagehide', exit)
  }, [enabled, done, stepId, emit])

  /** Called by the submit handlers once the server has accepted / rejected the lead. */
  const settle = useCallback((ok: boolean, reason?: string) => {
    const tracker = getTracker()
    const f = get()
    if (!tracker || !f) return
    const id = leadId.current ?? tracker.leadSubmit(funnelId)
    if (ok) {
      if (stepId) f.stepComplete(stepId)
      f.complete()
      tracker.leadSuccess(id, funnelId)
      tracker.flush()
    } else tracker.leadFailure(id, funnelId, reason)
    leadId.current = null
  }, [get, funnelId, stepId])

  return { emit, settle, identity }
}

export const useAutoTelemetry = (enabled: boolean, stepId: string | undefined, done: boolean) => useFunnelTelemetry('auto', '1.0.0', stepId, done, enabled)
