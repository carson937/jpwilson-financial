'use client'

import { forwardRef } from 'react'
import { selectableStates } from '@/lib/licensedStates'
import type { StepIcon } from '@/lib/quote-experience/types'
import { ChevronDownIcon, StepGlyph } from './icons'

/**
 * State picker, driven by LICENSED_STATES — never a hardcoded list. Adding a
 * state to lib/licensedStates.ts updates this control, both validators, the
 * footer, and the structured data at once.
 *
 * A native <select> on purpose: it gives the iOS wheel picker, full keyboard
 * support, and correct VoiceOver announcement for free. A custom dropdown here
 * would be worse on every one of those axes and would exist only for styling.
 */
const StateSelect = forwardRef<
  HTMLSelectElement,
  {
    id: string
    icon: StepIcon
    value: string
    onChange: (value: string) => void
    placeholder: string
    labelledBy?: string
    invalid?: boolean
    describedBy?: string
  }
>(function StateSelect(
  { id, icon, value, onChange, placeholder, labelledBy, invalid = false, describedBy },
  ref,
) {
  const states = selectableStates()

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-xl border bg-white px-4 transition-colors duration-200 focus-within:border-navy-900 focus-within:ring-4 focus-within:ring-navy-900/[0.06] ${
        invalid ? 'border-red-400' : 'border-navy-900/[0.13] hover:border-navy-900/25'
      }`}
    >
      <StepGlyph
        name={icon}
        className="h-5 w-5 shrink-0 text-navy-900/30 transition-colors group-focus-within:text-navy-900/55"
      />
      <select
        ref={ref}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        /* Focus is shown on the wrapper — see the note in TextInput. */
        className={`h-[54px] w-full min-w-0 appearance-none border-0 bg-transparent pr-8 text-[16px] outline-none focus-visible:outline-none ${
          value ? 'text-navy-900' : 'text-navy-900/30'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {states.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 h-5 w-5 text-navy-900/35" />
    </div>
  )
})

export default StateSelect
