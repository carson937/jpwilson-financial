import { selectableStates } from './licensedStates'

/**
 * Accepted state codes. Derived from lib/licensedStates.ts — while the licensed
 * list is unconfirmed this accepts every US state so the form stays usable and
 * makes no licensing claim. Do not hardcode states here.
 */
export const VALID_STATES: readonly string[] = selectableStates().map((s) => s.code)

export type LeadPayload = {
  firstName: string
  lastName: string
  phone: string
  email: string
  state: string
  zip: string
  coverageLabel: string
  situation: string
  urgency: string
  notes: string
  source: string
  website?: string
  /**
   * Quote Experience additions. Both are optional so the existing Hero and
   * Final CTA forms keep submitting exactly the payload they always have.
   *
   * `product` selects the server-side required-answer set (see
   * lib/quote-experience/products.ts). `homeOwnership` is a closed enum.
   */
  product?: string
  homeOwnership?: string
  insured?: string
  timing?: string
  vehicles?: string
  driving?: string
  bundle?: string
  consent?: string
}

/**
 * Home ownership is a closed set, not free text. An open string here would flow
 * into the lead note and, later, into whatever downstream mapping consumes it.
 */
export const HOME_OWNERSHIP_VALUES = ['Own', 'Rent'] as const
export type HomeOwnership = (typeof HOME_OWNERSHIP_VALUES)[number]

export function normalizeHomeOwnership(value: unknown) {
  const clean = normalizeText(value, 10)
  const match = HOME_OWNERSHIP_VALUES.find(
    (allowed) => allowed.toLowerCase() === clean.toLowerCase(),
  )
  return match ?? ''
}

export function isValidOptionalHomeOwnership(value: string) {
  if (!value) return true
  return (HOME_OWNERSHIP_VALUES as readonly string[]).includes(value)
}

export function normalizeText(value: unknown, maxLength = 500) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function normalizePhone(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

export function isValidUSPhone(value: string) {
  if (/[a-z]/i.test(value)) return false
  const digits = value.replace(/\D/g, '')
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return normalized.length === 10 && !/^(\d)\1{9}$/.test(normalized)
}

export function normalizeEmail(value: unknown) {
  return normalizeText(value, 254).toLowerCase()
}

export function normalizeState(value: unknown) {
  return normalizeText(value, 2).toUpperCase()
}

export function isValidState(value: string) {
  return VALID_STATES.includes(value)
}

export function normalizeZip(value: unknown) {
  return String(value ?? '').trim()
}

export function isValidZip(value: string) {
  return /^\d{5}$/.test(value)
}

export function isValidOptionalEmail(value: string) {
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function splitFullName(value: string) {
  const clean = normalizeText(value, 120)
  const parts = clean.split(' ').filter(Boolean)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
  }
}

/** A name needs at least one letter, while allowing international names and punctuation. */
export function hasNameLetter(value: string) {
  // Constructor form keeps the project's ES5 TypeScript target happy while
  // modern browsers still get Unicode-property matching.
  return new RegExp('\\p{L}', 'u').test(value)
}

export function validateLead(payload: LeadPayload) {
  if ((!payload.firstName && !payload.lastName) || !hasNameLetter(`${payload.firstName} ${payload.lastName}`)) {
    return 'Name is required.'
  }
  if (!payload.phone) {
    return 'Phone number is required.'
  }
  if (!isValidUSPhone(payload.phone)) {
    return 'Please enter a valid phone number.'
  }
  if (!isValidState(payload.state)) {
    return 'Please select your state.'
  }
  if (!isValidZip(payload.zip)) {
    return 'Please enter a valid 5-digit ZIP code.'
  }
  if (!isValidOptionalEmail(payload.email)) {
    return 'Please enter a valid email address or leave it blank.'
  }
  return ''
}
