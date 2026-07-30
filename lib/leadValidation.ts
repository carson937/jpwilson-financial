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
}

export function normalizeText(value: unknown, maxLength = 500) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function normalizePhone(value: unknown) {
  return String(value ?? '').trim().slice(0, 40)
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
  return String(value ?? '').replace(/\D/g, '').slice(0, 5)
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

export function validateLead(payload: LeadPayload) {
  if (!payload.firstName && !payload.lastName) {
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
