'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import { useEffect } from 'react'
import { GA_MEASUREMENT_ID, trackEvent } from '@/lib/analytics'

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

/**
 * Click tracking for tel:/mailto:/quote anchors, delegated from one listener so
 * every such link is covered (including ones added later) without per-link
 * handlers. `data-track-location` on a link names its placement; otherwise the
 * nearest landmark/section id is used.
 */
function linkLocation(a: HTMLAnchorElement) {
  const explicit = a.closest<HTMLElement>('[data-track-location]')?.dataset.trackLocation
  if (explicit) return explicit
  return a.closest('header, nav') ? 'nav' : a.closest('footer') ? 'footer' : a.closest('section[id]')?.id || 'page'
}

function onDocumentClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (href.startsWith('tel:')) trackEvent('phone_cta_clicked', { location: linkLocation(a) })
  else if (href.startsWith('mailto:')) trackEvent('email_cta_clicked', { location: linkLocation(a) })
  else if (href === '#get-quote') trackEvent('quote_cta_clicked', { location: linkLocation(a) })
}

export default function Analytics() {
  useEffect(() => {
    trackEvent('page_view', {
      path: window.location.pathname,
      title: document.title,
    })
    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  return (
    <>
      {/* GA4 base tag: initialised once, here, from the root layout. */}
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />

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
