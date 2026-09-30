import type { QuoteIntro } from '@/lib/quote-experience/types'
import { CheckCircleIcon, ClockIcon, ShieldIcon } from './icons'

/**
 * The reassurance block on the intro screen.
 *
 * Every line here is a factual statement about the process — no invented
 * statistics, no review scores, no testimonials, no carrier claims. If a line
 * cannot be defended literally, it does not belong on the page.
 */

const GLYPHS = [CheckCircleIcon, ShieldIcon, ClockIcon]

export default function TrustRow({ items }: { items: QuoteIntro['assurances'] }) {
  return (
    <ul className="space-y-3 rounded-xl bg-[#FBF8F1] px-5 py-5">
      {items.map((item, index) => {
        const Glyph = GLYPHS[index % GLYPHS.length]
        return (
          <li key={item} className="flex items-center gap-3">
            <Glyph className="h-[18px] w-[18px] shrink-0 text-gold" />
            <span className="text-[14.5px] font-medium text-navy-900/85">{item}</span>
          </li>
        )
      })}
    </ul>
  )
}
