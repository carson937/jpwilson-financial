import { getTracker } from '@/lib/tracker'
import { GA_MEASUREMENT_ID } from '@/lib/ga'

export { GA_MEASUREMENT_ID }

/**
 * Legacy landing-page event vocabulary, kept so existing components do not change. It is now a
 * thin adapter onto the ONE CAPS tracker (lib/tracker.ts): GA4, Vercel and CAPS ingestion are
 * all fed from there. New code should use getTracker() / funnel APIs directly.
 *
 * Landing funnels (see lib/caps-tracking/jp-wilson.json):
 *   home-quiz   steps coverage > situation > urgency > contact   (hero quiz, form 'hero_quiz')
 *   bottom-form step form                                         (form 'bottom_form')
 * Form answers are never forwarded: only the funnel/step ids below.
 */
export type AnalyticsEvent =
  | 'page_view'
  | 'quiz_started'
  | 'coverage_selected'
  | 'quiz_step_completed'
  | 'form_submission_attempted'
  | 'form_submission_succeeded'
  | 'form_submission_failed'
  | 'phone_cta_clicked'
  | 'service_cta_clicked'
  | 'booking_cta_clicked'
  | 'email_cta_clicked'
  | 'quote_cta_clicked'

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const HOME_QUIZ_STEPS = ['coverage', 'situation', 'urgency', 'contact'] as const
const pendingLead = new Map<string, string>()

function funnelIdFor(params: EventParams): 'home-quiz' | 'bottom-form' {
  return params.form === 'bottom_form' ? 'bottom-form' : 'home-quiz'
}

const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

export function trackEvent(event: AnalyticsEvent, params: EventParams = {}) {
  if (typeof window === 'undefined') return
  const tracker = getTracker()

  // Meta Pixel (unchanged behaviour): page views + accepted leads only.
  if (window.fbq) {
    if (event === 'page_view') window.fbq('track', 'PageView')
    else if (event === 'form_submission_succeeded') window.fbq('track', 'Lead')
  }

  if (!tracker) return
  const location = typeof params.location === 'string' ? params.location : 'page'

  switch (event) {
    case 'page_view':
      return // the tracker's pageView() is driven by the route listener in components/Analytics.tsx
    case 'phone_cta_clicked':
      return tracker.phoneClick(location)
    case 'email_cta_clicked':
      return tracker.emailClick(location)
    case 'booking_cta_clicked':
      return tracker.ctaClick('booking', location)
    case 'quote_cta_clicked':
      return tracker.ctaClick('get-quote', location)
    case 'service_cta_clicked':
      return tracker.ctaClick('service', 'services')
    case 'coverage_selected':
      return // the answer itself is not analytics data; funnel steps carry progress
    case 'quiz_started': {
      const f = tracker.funnel('home-quiz')
      f.view()
      f.start()
      return f.stepView('coverage')
    }
    case 'quiz_step_completed': {
      const f = tracker.funnel('home-quiz')
      const n = typeof params.step === 'number' ? params.step : 0
      const done = HOME_QUIZ_STEPS[n - 1]
      const next = HOME_QUIZ_STEPS[n]
      if (done) f.stepComplete(done)
      if (next) f.stepView(next)
      return
    }
    case 'form_submission_attempted': {
      const id = funnelIdFor(params)
      const f = tracker.funnel(id)
      f.view()
      f.start()
      f.stepView(id === 'home-quiz' ? 'contact' : 'form')
      pendingLead.set(id, tracker.leadSubmit(id))
      return
    }
    case 'form_submission_succeeded': {
      const id = funnelIdFor(params)
      const f = tracker.funnel(id)
      f.stepComplete(id === 'home-quiz' ? 'contact' : 'form')
      f.complete()
      const leadId = pendingLead.get(id) ?? tracker.leadSubmit(id)
      tracker.leadSuccess(leadId, id)
      pendingLead.delete(id)
      if (adsConversionLabel) window.gtag?.('event', 'conversion', { send_to: adsConversionLabel })
      tracker.flush()
      return
    }
    case 'form_submission_failed': {
      const id = funnelIdFor(params)
      const leadId = pendingLead.get(id)
      if (leadId) tracker.leadFailure(leadId, id, typeof params.status === 'string' || typeof params.status === 'number' ? `status_${params.status}` : undefined)
      pendingLead.delete(id)
      return
    }
  }
}
