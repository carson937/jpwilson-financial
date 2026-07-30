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

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

export function trackEvent(event: AnalyticsEvent, params: EventParams = {}) {
  if (typeof window === 'undefined') return

  window.gtag?.('event', event, params)

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
