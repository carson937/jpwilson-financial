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

/**
 * GA4 measurement ID. The ID is public by design (it ships in every page), so
 * it is committed as the default; NEXT_PUBLIC_GA_MEASUREMENT_ID overrides it
 * (e.g. a separate staging property).
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-837LY8SGTM'

// Existing funnel events -> GA4 events. The original event is always sent
// as-is; these are additive so GA4 recommended events/key events light up.
const GA_BRIDGED_EVENTS: Partial<Record<AnalyticsEvent, string[]>> = {
  quiz_started: ['quote_start'],
  form_submission_succeeded: ['generate_lead', 'quote_complete'],
}

const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

export function trackEvent(event: AnalyticsEvent, params: EventParams = {}) {
  if (typeof window === 'undefined') return

  // GA4 sends page_view itself (including App Router navigations), so the
  // internal page_view only reaches Meta Pixel; forwarding it would double-count.
  if (event !== 'page_view') {
    window.gtag?.('event', event, params)
    for (const bridged of GA_BRIDGED_EVENTS[event] ?? []) {
      window.gtag?.('event', bridged, params)
    }
  }

  if (event === 'form_submission_succeeded' && adsConversionLabel) {
    window.gtag?.('event', 'conversion', {
      send_to: adsConversionLabel,
      ...params,
    })
  }

  if (window.fbq) {
    const metaEvent =
      event === 'page_view'
        ? 'PageView'
        : event === 'form_submission_succeeded'
          ? 'Lead'
          : 'trackCustom'

    if (metaEvent === 'trackCustom') {
      window.fbq('trackCustom', event, params)
    } else {
      window.fbq('track', metaEvent, params)
    }
  }
}
