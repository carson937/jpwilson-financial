import { BrandCrest } from './BrandLogo'
import { OFFICE, licensedStatesSentence } from '@/lib/licensedStates'

const serviceLinks = [
  { label: 'Life Insurance', href: '#services' },
  { label: 'Business Insurance', href: '#services' },
  { label: 'Commercial Auto Insurance', href: '#services' },
  { label: 'Home & Auto Insurance', href: '#services' },
  { label: 'Health Insurance', href: '#services' },
  { label: 'Medicare Insurance', href: '#services' },
  { label: 'General Liability', href: '#services' },
  { label: 'Workers’ Compensation', href: '#services' },
]

const companyLinks = [
  { label: 'About Patrick', href: '#about' },
  { label: 'Licensed to Serve', href: '#licensed' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Get a Quote', href: '#get-quote' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/6 text-white/55">
      <div className="max-w-7xl mx-auto px-8 md:px-14 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            {/*
              Official crest only. The supplied wordmark is dark navy ink on
              white and there is no reversed master yet, so it is not placed on
              this near-black footer. The brand name is carried in the legal bar
              below.
            */}
            <div className="mb-5">
              <BrandCrest size={64} className="mb-4" />
              <p className="font-serif text-sm font-bold text-white/80 leading-tight">JP Wilson</p>
              <p className="text-[10px] text-gold tracking-[0.15em] uppercase mt-0.5">Financial Group</p>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-[220px]">
              Independent insurance guidance for individuals, families, and
              businesses.
            </p>
            <a
              href="tel:+18667861585"
              className="inline-block py-1 text-gold font-semibold text-sm hover:text-gold-light transition-colors duration-200"
            >
              (866) 786-1585
            </a>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white/55 text-[10px] font-semibold tracking-[0.2em] uppercase mb-6">
              Services
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-block py-1 text-sm hover:text-white/70 transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/55 text-[10px] font-semibold tracking-[0.2em] uppercase mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-block py-1 text-sm hover:text-white/70 transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/55 text-[10px] font-semibold tracking-[0.2em] uppercase mb-6">
              Contact
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Phone</p>
                <a href="tel:+18667861585" className="inline-block py-1 hover:text-white/70 transition-colors duration-200">
                  (866) 786-1585
                </a>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Email</p>
                {/* `break-words` is load-bearing: at md the footer becomes four
                    ~127px columns and this 206px address otherwise overhangs the
                    viewport, which only `body { overflow-x: hidden }` was
                    masking. Matches LicensedToServe, which already wraps it. */}
                <a
                  href="mailto:contact@jpwilsonfinancial.com"
                  className="block py-1 break-words [overflow-wrap:anywhere] hover:text-white/70 transition-colors duration-200"
                >
                  contact@jpwilsonfinancial.com
                </a>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Hours</p>
                <p>Mon – Fri, 9am – 5pm EST</p>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Office</p>
                <a
                  href={OFFICE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="not-italic hover:text-white/70 transition-colors duration-200"
                >
                  <address className="not-italic leading-relaxed">
                    {OFFICE.street}
                    <br />
                    {OFFICE.city}, {OFFICE.state} {OFFICE.zip}
                  </address>
                </a>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Licensed States</p>
                <p className="leading-relaxed">{licensedStatesSentence()}</p>
                <p className="text-white/60 text-xs mt-1">Charlotte is our only office.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-white/6 pt-8 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-white/45">
          <p>
            &copy; {new Date().getFullYear()} JP Wilson Financial Group. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="inline-block py-1 hover:text-white/35 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="inline-block py-1 hover:text-white/35 transition-colors duration-200">
              Terms of Service
            </a>
            <span>Charlotte, NC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
