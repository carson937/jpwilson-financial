import CrestLogo from './CrestLogo'

const serviceLinks = [
  { label: 'Medicare Insurance', href: '#services' },
  { label: 'Life Insurance', href: '#services' },
  { label: 'Business Insurance', href: '#services' },
  { label: 'Auto Insurance', href: '#services' },
  { label: 'Home Insurance', href: '#services' },
]

const companyLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Client Reviews', href: '#testimonials' },
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
            <div className="mb-5">
              <CrestLogo size={64} className="mb-4" />
              <p className="font-serif text-sm font-bold text-white/80 leading-tight">J.P. Wilson</p>
              <p className="text-[10px] text-gold tracking-[0.15em] uppercase mt-0.5">Financial Group</p>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-[220px]">
              Independent insurance experts comparing 30+ top carriers to find you
              better coverage at the right price.
            </p>
            <a
              href="tel:+18667861585"
              className="text-gold font-semibold text-sm hover:text-gold-light transition-colors duration-200"
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
                    className="text-sm hover:text-white/70 transition-colors duration-200"
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
                    className="text-sm hover:text-white/70 transition-colors duration-200"
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
                <a href="tel:+18667861585" className="hover:text-white/70 transition-colors duration-200">
                  (866) 786-1585
                </a>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Email</p>
                <a
                  href="mailto:contact@jpwilsonfinancial.com"
                  className="hover:text-white/70 transition-colors duration-200"
                >
                  contact@jpwilsonfinancial.com
                </a>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Hours</p>
                <p>Mon – Fri, 9am – 5pm EST</p>
              </div>
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.15em] mb-1">Licensed In</p>
                <p>South Carolina &amp; North Carolina</p>
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
            <a href="/privacy" className="hover:text-white/35 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white/35 transition-colors duration-200">
              Terms of Service
            </a>
            <span>Licensed Insurance Agent · SC &amp; NC</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
