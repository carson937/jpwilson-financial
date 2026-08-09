'use client'

import { forwardRef, useRef } from 'react'
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
    phoneInvalid: boolean
    emailInvalid: boolean
    describedBy?: string
  }
>(function ContactCapture(
  { phone, email, onPhoneChange, onEmailChange, phoneInvalid, emailInvalid, describedBy },
  ref,
) {
  const emailRef = useRef<HTMLInputElement>(null)

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
        required
        invalid={phoneInvalid}
        describedBy={describedBy}
        enterKeyHint="next"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            emailRef.current?.focus()
          }
        }}
      />

      <TextInput
        ref={emailRef}
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
        invalid={emailInvalid}
        describedBy={emailInvalid ? describedBy : undefined}
        enterKeyHint="go"
      />
    </div>
  )
})
