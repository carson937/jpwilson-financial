'use client'

import { useState, useEffect } from 'react'
import CrestLogo from './CrestLogo'

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'Contact', href: '#get-quote' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-500 ${
        scrolled
          ? 'shadow-sm shadow-navy-900/10 border-b border-navy-900/10'
          : 'border-b border-navy-900/6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Brand mark */}
          <a href="/" className="flex items-center gap-3 group">
            <CrestLogo size={52} />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[13px] font-bold tracking-[0.1em] text-navy-950 group-hover:text-gold transition-colors duration-300">
                J.P. Wilson
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-navy-900/65 font-medium">
                Financial Group
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
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
              className="text-[13px] font-medium text-navy-900/65 hover:text-navy-900/90 transition-colors duration-200"
            >
              (866) 786-1585
            </a>
            <a
              href="#get-quote"
              className="bg-gold hover:bg-gold-dark text-navy-950 text-[13px] font-semibold px-5 py-2.5 tracking-wide transition-colors duration-300"
            >
              Free Quote
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-navy-900/60 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu — premium dark dropdown on light nav */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
        <div className="bg-navy-950 border-t border-gold/10 px-6 py-7 flex flex-col gap-5">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-white/75 text-base font-medium hover:text-gold transition-colors tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/8 flex flex-col gap-3 mt-1">
            <a
              href="#get-quote"
              className="bg-gold text-navy-950 text-sm font-semibold px-5 py-3.5 text-center transition-colors hover:bg-gold-dark tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              Get Free Quote
            </a>
            <a
              href="tel:+18667861585"
              className="text-gold/70 text-center text-sm tracking-wide"
            >
              (866) 786-1585
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
