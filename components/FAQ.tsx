'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Do I pay more by using a broker?',
    a: 'No. Our service is completely free to you. We are compensated by the insurance carrier when you enroll — the price you pay is identical whether you go direct or through us. In most cases, we find you a lower price than going direct.',
  },
  {
    q: 'How long does it take to get a quote?',
    a: 'Most quotes are ready within 24 hours or less. For Medicare and life insurance, we often have options for you same-day. We move at your pace — no pressure.',
  },
  {
    q: 'Can you compare Medicare plans for me?',
    a: 'Yes — Medicare is one of our specialties. We compare Medicare Advantage, Medicare Supplement (Medigap), and Part D drug plans across all major carriers in your area and walk you through exactly what each one covers.',
  },
  {
    q: "What's the difference between Medicare Advantage and Medicare Supplement?",
    a: 'Medicare Advantage replaces Original Medicare through a private insurer and typically has lower premiums with copays and networks. Medicare Supplement pays alongside Original Medicare to cover out-of-pocket costs, giving you more flexibility. We explain both clearly and help you choose based on your health needs and budget.',
  },
  {
    q: 'What states do you serve?',
    a: 'We are licensed in South Carolina and North Carolina. If you are in another state, contact us — we will either confirm coverage or connect you with a trusted local resource.',
  },
  {
    q: 'Is there any obligation to buy after getting a quote?',
    a: 'None whatsoever. We provide quotes with zero pressure and zero obligation. Our goal is to give you the best information possible so you can make the right decision — whether that means enrolling with us or not.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-8 md:px-14">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24">

          {/* Left — sticky label + contact */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-6 bg-gold flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/70">
                FAQ
              </p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-950 tracking-[-0.02em] leading-[1.05] mb-8">
              Questions?
              <br />
              We Have
              <br />
              <span className="text-navy-900/55 italic">Answers.</span>
            </h2>
            <p className="text-navy-900/65 text-sm leading-relaxed mb-8">
              Still have questions? Call us directly — a real advisor answers.
            </p>
            <a
              href="tel:+18667861585"
              className="inline-flex items-center gap-3 text-navy-900/60 font-semibold text-base hover:text-gold transition-colors duration-300"
            >
              <span className="w-9 h-9 border border-gold/30 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              (866) 786-1585
            </a>
          </div>

          {/* Right — accordion */}
          <div className="divide-y divide-navy-900/8">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6">
                <button
                  className="w-full flex items-start justify-between gap-6 text-left group"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="text-navy-900/70 font-semibold text-base group-hover:text-navy-950 transition-colors duration-200">
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-5 h-5 border border-navy-900/15 flex items-center justify-center text-navy-900/25 group-hover:text-gold group-hover:border-gold/40 transition-all mt-0.5 ${
                      openIndex === i ? 'rotate-45 text-gold border-gold/40' : ''
                    }`}
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? 'max-h-96 mt-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-navy-900/70 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
