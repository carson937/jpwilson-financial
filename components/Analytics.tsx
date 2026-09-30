'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { attachLinkTracking } from '@/lib/caps-tracking/client'
import { GA_MEASUREMENT_ID, trackEvent } from '@/lib/analytics'
import { getTracker } from '@/lib/tracker'

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

/**
 * Mounted once from the root layout, so every route (landing, funnels, legal) is covered.
 * GA4 base tag: one <GoogleAnalytics>. Vercel Web Analytics: one <VercelAnalytics>.
 * CAPS tracker: boots once, tracks route changes, delegates tel:/mailto:/data-cta-id clicks,
 * and flushes its batch when the page is hidden.
 */
function TrackerBoot() {
  const pathname = usePathname()

  useEffect(() => {
    const tracker = getTracker()
    if (!tracker) return
    attachLinkTracking(document, tracker)
    const flush = () => tracker.flush()
    const onHide = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    const timer = window.setInterval(flush, 5000)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    getTracker()?.pageView()
    trackEvent('page_view', { path: pathname })
  }, [pathname])

  return null
}

export default function Analytics() {
  return (
    <>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <VercelAnalytics />
      <TrackerBoot />

      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
          `}
        </Script>
      )}
    </>
  )
}
