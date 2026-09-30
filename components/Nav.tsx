'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLockup from './BrandLogo'
import { trackEvent } from '@/lib/analytics'

const navLinks = [
  { label: 'Services', hash: '#services' },
  { label: 'About', hash: '#about' },
  { label: 'How It Works', hash: '#how-it-works' },
  { label: 'Contact', hash: '#get-quote' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Bare hashes only resolve on the page that owns the sections. From /privacy
  // and /terms the same links have to route home first.
  const onHome = pathname === '/'
  const linkTo = (hash: string) => (onHome ? hash : `/${hash}`)
  const quoteHref = linkTo('#get-quote')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu when the viewport grows past the md breakpoint, so
  // the menu never stays "open" behind the desktop nav after a rotation.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Lock body scroll while the mobile menu is open. iOS Safari ignores
  // `overflow: hidden` on <body> once a scroll is in flight, so the scroll
  // position is pinned with `position: fixed` and restored on close.
  useEffect(() => {
    if (!menuOpen) return

    const scrollY = window.scrollY
    const { body } = document
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-500 pt-[env(safe-area-inset-top)] ${
        scrolled
          ? 'shadow-sm shadow-navy-900/10 border-b border-navy-900/10'
          : 'border-b border-navy-900/6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">

          {/* Brand mark — official lockup, light surface (nav is white) */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="JP Wilson Financial Group — home">
            <span className="md:hidden">
              <BrandLockup height={30} alt="" />
            </span>
            <span className="hidden md:inline-flex">
              <BrandLockup height={40} alt="" />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, hash }) => (
              <a
                key={label}
                href={linkTo(hash)}
                className="text-[13px] font-medium tracking-wide text-navy-900/80 hover:text-navy-950 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-5">
            <a
              href="tel:+18667861585"
              data-cta-location="desktop_nav"
              className="text-[13px] font-medium text-navy-900/65 hover:text-navy-900/90 transition-colors duration-200"
            >
              (866) 786-1585
            </a>
            <a
              href={quoteHref} data-cta-id="get-quote" data-cta-location="nav"
              className="bg-gold hover:bg-gold-dark text-navy-950 text-[13px] font-semibold px-5 py-2.5 tracking-wide transition-colors duration-300"
            >
              Free Review
            </a>
          </div>

          {/* Mobile hamburger — 44px touch target */}
          <button
            type="button"
            className="md:hidden -mr-2 flex h-11 w-11 items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {/*
        Mobile menu. Animated with grid-template-rows 0fr→1fr so the panel is
        never clipped by a guessed max-height — link labels wrap freely at
        320px. Browsers without interpolable grid rows simply snap open, which
        is a correct fallback. The panel scrolls internally and reserves the
        home-indicator inset.
      */}
      <div
        id="mobile-menu"
        className={`md:hidden grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="bg-navy-950 border-t border-gold/10 px-6 py-7 flex flex-col gap-5 max-h-[70svh] overflow-y-auto overscroll-contain"
            style={{ paddingBottom: 'calc(1.75rem + env(safe-area-inset-bottom))' }}
          >
            {navLinks.map(({ label, hash }) => (
              <a
                key={label}
                href={linkTo(hash)}
                className="flex min-h-11 items-center text-white/75 text-base font-medium hover:text-gold transition-colors tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/8 flex flex-col gap-3 mt-1">
              <a
                href={quoteHref} data-cta-id="get-quote" data-cta-location="mobile_nav"
                className="bg-gold text-navy-950 text-sm font-semibold px-5 py-3.5 text-center transition-colors hover:bg-gold-dark tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Get Free Review
              </a>
              <a
                href="tel:+18667861585"
                data-cta-location="mobile_nav"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center justify-center text-gold/70 text-center text-sm tracking-wide"
              >
                (866) 786-1585
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
