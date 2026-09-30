'use client'

import { useState, useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function MobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`site-mobile-cta fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      {/* Reserve the home-indicator inset so the buttons are never half-covered
          on notched iPhones. Requires viewportFit: 'cover' (see app/layout). */}
      <div
        className="bg-navy-900 border-t border-white/10 px-4 py-3 flex gap-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        {/* While the bar is off-screen the wrapper is aria-hidden, so these
            links must also leave the tab order — otherwise keyboard users can
            focus a control that screen readers cannot see (WCAG 4.1.2). */}
        <a
          href="#get-quote" data-cta-id="get-quote" data-cta-location="mobile_sticky"
          tabIndex={visible ? 0 : -1}
          className="flex-1 bg-gold hover:bg-gold-dark text-navy-950 text-sm font-semibold py-3.5 text-center transition-colors"
        >
          Get Free Quote
        </a>
        <a
          href="tel:+18667861585"
          tabIndex={visible ? 0 : -1}
          data-cta-location="mobile_sticky"
          className="flex-1 border border-white/20 hover:border-gold text-white text-sm font-semibold py-3.5 text-center flex items-center justify-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Call Now
        </a>
      </div>
    </div>
  )
}
