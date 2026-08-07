'use client'

import { forwardRef } from 'react'
import TextInput from './TextInput'

/**
 * The combined contact screen — phone and email on ONE screen.
 *
 * Splitting these into two steps tests worse and reads as an interrogation at
 * the exact moment intent peaks. Required/Optional is stated on each label so
 * nobody has to guess whether the email is a demand.
 *
 * Input types are set for mobile: `tel` raises the numeric keypad, `email`
 * raises the @ keyboard, and the last field submits with the Enter key.
 */
export default forwardRef<
  HTMLInputElement,
  {
    phone: string
    email: string
    onPhoneChange: (value: string) => void
    onEmailChange: (value: string) => void
    invalid: boolean
    describedBy?: string
  }
>(function ContactCapture(
  { phone, email, onPhoneChange, onEmailChange, invalid, describedBy },
  ref,
) {
  return (
    <div className="space-y-4">
      <TextInput
        ref={ref}
        id="qx-phone"
        icon="phone"
        label="Phone number"
        badge={{ text: 'Required', tone: 'required' }}
        value={phone}
        onChange={onPhoneChange}
        placeholder="(704) 555-0142"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={20}
        invalid={invalid}
        describedBy={describedBy}
        enterKeyHint="next"
      />

      <TextInput
        id="qx-email"
        icon="mail"
        label="Email address"
        badge={{ text: 'Optional', tone: 'optional' }}
        value={email}
        onChange={onEmailChange}
        placeholder="you@example.com"
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={254}
        enterKeyHint="go"
      />
    </div>
  )
})
