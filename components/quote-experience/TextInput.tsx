'use client'

import { forwardRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { StepIcon } from '@/lib/quote-experience/types'
import { StepGlyph } from './icons'

/**
 * The one text input the funnel uses, shared by the name, ZIP, phone, and email
 * fields. A single field component is why every screen's input is pixel-identical.
 *
 * Accessibility: the visible question is the field's label via `aria-labelledby`
 * — the question IS the label, so a second one would be redundant noise in a
 * screen reader. Errors are wired with `aria-describedby` + `aria-invalid`.
 */

type TextInputProps = {
  id: string
  icon: StepIcon
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** id of the element that labels this input. */
  labelledBy?: string
  /** Visible label, used when the field is one of several on a screen. */
  label?: string
  /** Right-aligned "Required" / "Optional" marker. */
  badge?: { text: string; tone: 'required' | 'optional' }
  type?: 'text' | 'tel' | 'email'
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  maxLength?: number
  required?: boolean
  invalid?: boolean
  describedBy?: string
  enterKeyHint?: 'next' | 'done' | 'go'
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    id,
    icon,
    value,
    onChange,
    placeholder,
    labelledBy,
    label,
    badge,
    type = 'text',
    inputMode,
    autoComplete,
    maxLength,
    required = false,
    invalid = false,
    describedBy,
    enterKeyHint = 'next',
    onKeyDown,
  },
  ref,
) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 flex items-baseline justify-between gap-3 text-[14px] font-medium text-navy-900"
        >
          <span>{label}</span>
          {badge && (
            <span
              className={`text-[12.5px] font-medium ${
                badge.tone === 'required' ? 'text-gold-dark' : 'text-navy-900/40'
              }`}
            >
              {badge.text}
            </span>
          )}
        </label>
      )}

      <div
        className={`group flex items-center gap-3 rounded-xl border bg-white px-4 transition-colors duration-200 focus-within:border-navy-900 focus-within:ring-4 focus-within:ring-navy-900/[0.06] ${
          invalid ? 'border-red-400' : 'border-navy-900/[0.13] hover:border-navy-900/25'
        }`}
      >
        <StepGlyph
          name={icon}
          className="h-5 w-5 shrink-0 text-navy-900/30 transition-colors group-focus-within:text-navy-900/55"
        />
        <input
          ref={ref}
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          maxLength={maxLength}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-labelledby={label ? undefined : labelledBy}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          /*
            16px minimum: anything smaller makes iOS Safari zoom on focus.

            `focus-visible:outline-none` suppresses the site-wide gold focus
            outline from globals.css — here the focus indicator is the wrapper's
            border change plus its 4px ring, which is a stronger signal than an
            outline drawn inside the field's own border.
          */
          className="h-[54px] w-full min-w-0 border-0 bg-transparent text-[16px] text-navy-900 outline-none focus-visible:outline-none placeholder:text-navy-900/30"
        />
      </div>
    </div>
  )
})

export default TextInput
