/**
 * ============================================================================
 * LICENSED STATES — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * THIS IS THE ONLY PLACE TO EDIT when Patrick confirms the licensed-state list.
 *
 * Add the confirmed two-letter state codes to LICENSED_STATES below. Nothing
 * else needs to change anywhere in the codebase.
 *
 *   Example once confirmed:
 *     export const LICENSED_STATES: StateCode[] = ['NC', 'SC', 'GA']
 *
 * While the array is empty:
 *   - No licensed-state claim renders anywhere on the public site.
 *   - No badge, no placeholder, no "coming soon" text is shown.
 *   - Quote-form state pickers fall back to the full US list so the form still
 *     works without implying a licensing claim.
 *
 * Do not hardcode state names into copy, metadata, or structured data. Prior
 * "Serving NC & SC" wording was removed on 2026-07-29 because the list was
 * never client-confirmed.
 * ============================================================================
 */

export type StateCode = keyof typeof US_STATES

/** ⬇⬇⬇ THE ONE LINE TO EDIT — confirmed by Patrick Wilson 2026-07-29 ⬇⬇⬇ */
export const LICENSED_STATES: StateCode[] = ['NC', 'SC', 'GA', 'TN']
/** ⬆⬆⬆ THE ONE LINE TO EDIT ⬆⬆⬆ */

export const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
} as const

/** True once Patrick's list is in. Gates every public licensed-state display. */
export function hasLicensedStates(): boolean {
  return LICENSED_STATES.length > 0
}

/** Full state names for the confirmed list, in the order given. */
export function licensedStateNames(): string[] {
  return LICENSED_STATES.map((code) => US_STATES[code])
}

/** "North Carolina and South Carolina" / "NC, SC, and GA" — empty when unconfirmed. */
export function licensedStatesSentence(): string {
  const names = licensedStateNames()
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

/**
 * Options for quote-form state pickers. Falls back to every US state while the
 * licensed list is unconfirmed so the form stays usable and claim-free.
 */
export function selectableStates(): Array<{ code: string; name: string }> {
  const codes = hasLicensedStates() ? LICENSED_STATES : (Object.keys(US_STATES) as StateCode[])
  return codes.map((code) => ({ code, name: US_STATES[code] }))
}

/** Neutral copy used wherever a service-area claim used to sit. */
export const NEUTRAL_SERVICE_AREA = {
  short: 'Independent guidance',
  eyebrow: 'Personalized Insurance Guidance',
  sentence: 'Coverage for individuals, families, and businesses.',
} as const

/**
 * The single confirmed physical office. Licensed states above are where Patrick
 * can write business; this is the only place with a physical location. Never
 * imply an office in every licensed state.
 */
export const OFFICE = {
  street: '1200 The Plaza',
  city: 'Charlotte',
  state: 'NC',
  zip: '28205',
  mapsUrl: 'https://maps.google.com/?q=1200+The+Plaza,+Charlotte,+NC+28205',
  hours: 'Mon – Fri, 9am – 5pm EST',
} as const
