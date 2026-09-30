'use client'

import type { StepIcon } from '@/lib/quote-experience/types'
import { CheckIcon, StepGlyph } from './icons'

/**
 * A selectable option card — the Own/Rent control.
 *
 * Selection is expressed three ways, not one: gold border, gold-tinted surface,
 * and a filled check badge. Colour alone would fail anyone who cannot
 * distinguish it, and the badge is what makes the selected state feel
 * deliberate rather than merely highlighted.
 *
 * Rendered as a radio group. Real radio inputs give arrow-key navigation and
 * correct group semantics; a div with onClick gives neither.
 */
export default function ChoiceCard({
  name,
  value,
  label,
  icon,
  selected,
  onSelect,
}: {
  name: string
  value: string
  label: string
  icon: StepIcon
  selected: boolean
  onSelect: (value: string) => void
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border px-4 py-7 transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-navy-900/[0.08] ${
        selected
          ? 'border-gold bg-gold/[0.06] shadow-[0_2px_10px_-4px_rgba(184,136,42,0.4)]'
          : 'border-navy-900/[0.13] bg-white hover:border-navy-900/30 hover:bg-navy-900/[0.015]'
      }`}
    >
      {/*
        Visually hidden, but NOT hidden from assistive technology or the
        keyboard. The <label> wraps the entire card, so the whole card is
        already the tap target — the input does not need to be painted, and
        an invisible overlay on top of it would add nothing.
      */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />

      <span
        className={`absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
          selected ? 'scale-100 bg-gold opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <CheckIcon className="h-3.5 w-3.5 text-white" />
      </span>

      <StepGlyph
        name={icon}
        className={`h-8 w-8 transition-colors duration-200 ${
          selected ? 'text-gold' : 'text-navy-900/70'
        }`}
      />
      <span
        className={`text-[15px] font-semibold transition-colors duration-200 ${
          selected ? 'text-navy-900' : 'text-navy-900/80'
        }`}
      >
        {label}
      </span>
    </label>
  )
}
