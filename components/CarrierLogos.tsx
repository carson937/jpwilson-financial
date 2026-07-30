const carriers = [
  'Medicare Advantage', 'Medicare Supplement', 'Part D', 'Life Insurance',
  'Final Expense', 'Auto Insurance', 'Homeowners', 'Renters Insurance',
  'Business Liability', 'Commercial Property', 'Workers Comp', 'Umbrella',
  'Medicare Advantage', 'Medicare Supplement', 'Part D', 'Life Insurance',
  'Final Expense', 'Auto Insurance', 'Homeowners', 'Renters Insurance',
  'Business Liability', 'Commercial Property', 'Workers Comp', 'Umbrella',
]

export default function CarrierLogos() {
  return (
    <section className="bg-bone py-14 border-b border-navy-900/8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-14 mb-8">
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-navy-900/65 text-center">
          Coverage Patrick Can Help Compare
        </p>
      </div>

      <div className="relative flex overflow-hidden marquee-fade">
        <div className="flex animate-marquee whitespace-nowrap">
          {carriers.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-7 text-navy-900/30 font-semibold text-xs tracking-[0.12em] uppercase"
            >
              {name}
              <span className="ml-7 w-1 h-1 rounded-full bg-gold/40 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
