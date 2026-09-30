/**
 * ============================================================================
 * COMBINED GENERAL LIABILITY + WORKERS' COMP FUNNEL — shared logic
 * ============================================================================
 *
 * The commercial funnel asks a handful of coarse qualification questions, then
 * hands a named, in-state business lead to AgencyZoom. Detailed underwriting
 * (payroll by class, exact headcount, loss runs, limits) is the advisor's
 * follow-up call — never collected here and never routed through `notes`.
 *
 * Every value below is a closed enum. The renderer, the client validator, and
 * the server validator all read these lists; a crafted request cannot turn a
 * product answer into free text.
 * ============================================================================
 */

/** Bump when the consent wording changes. Travels with the lead for the record. */
export const COMMERCIAL_CONSENT_VERSION = 'commercial-contact-v1'

/**
 * The ONE consent error string. The client validator, the server validator, and
 * the checkbox's aria-invalid all read it, so a visitor who is refused by the
 * server sees the same sentence — and the same field marked invalid — as one
 * refused in the browser. Previously the two differed and the checkbox only lit
 * up for the client's wording, because the match was a substring test for "box".
 */
export const CONSENT_REQUIRED_MESSAGE =
  'Please check the box to agree before sending your request.'

export const COMMERCIAL_CONSENT_TEXT =
  'I agree that JP Wilson Financial Group may contact me about this request by phone, text, or email, including by automated means. Consent is not a condition of purchase. Message and data rates may apply.'

export const COMMERCIAL_VALUES = {
  industry: [
    'contractor',
    'cleaning',
    'retail',
    'restaurant',
    'professional',
    'auto_service',
    'fitness',
    'other',
  ],
  coverageNeed: ['both', 'general_liability', 'workers_comp', 'unsure'],
  employeeRange: ['0', '1', '5', '11', '26', 'unsure'],
  currentCoverage: ['none', 'soon', 'quarter', 'flexible', 'unsure', 'job', 'review'],
  insuranceStatus: ['insured', 'uninsured', 'unsure'],
  claims: ['none', 'one', 'multiple', 'unsure', 'open', 'past'],
} as const

export type CommercialField = keyof typeof COMMERCIAL_VALUES

/** Per-field label maps. `none` / `unsure` mean different things per question. */
const LABELS: Record<CommercialField, Record<string, string>> = {
  industry: {
    contractor: 'Contractor / trades',
    cleaning: 'Cleaning / janitorial',
    retail: 'Retail / shop',
    restaurant: 'Food / hospitality',
    professional: 'Professional / office',
    auto_service: 'Auto service / repair',
    fitness: 'Health / fitness / salon',
    other: 'Something else',
  },
  coverageNeed: {
    both: 'General Liability and Workers Comp',
    general_liability: 'General Liability',
    workers_comp: 'Workers Comp',
    unsure: 'Needs guidance',
  },
  employeeRange: {
    '0': 'No employees (excluding owners)',
    unsure: 'Employee count unsure',
    '1': '1-4 employees',
    '5': '5-10 employees',
    '11': '11-25 employees',
    '26': '26 or more employees',
  },
  currentCoverage: {
    job: 'Coverage for a job or contract',
    review: 'Comparing options / renewing later',
    none: 'Not insured yet',
    soon: 'Renews within 30 days',
    quarter: 'Renews in 1-3 months',
    flexible: 'Renews in 3+ months',
    unsure: 'Not sure',
  },
  insuranceStatus: { insured: 'Currently insured', uninsured: 'No current coverage', unsure: 'Not sure' },
  claims: {
    open: 'Current or open claim',
    past: 'Past claim within 3 years',
    none: 'None',
    one: 'One',
    multiple: 'More than one',
    unsure: 'Needs to check',
  },
}

export function commercialLabel(field: CommercialField, value: string | undefined): string {
  return LABELS[field][value ?? ''] ?? value ?? ''
}

/**
 * Business ZIP → the licensed state it falls in, or '' when the ZIP is outside
 * JP Wilson's licensed footprint (NC, SC, GA, TN).
 *
 * Ranges are the USPS first-three-digit prefixes:
 *   NC 270-289 · SC 290-299 · GA 300-319 + 398-399 · TN 370-385
 *
 * This is the funnel's licensing gate. The server independently rejects any
 * state that is not in LICENSED_STATES, so an edge ZIP this misses is turned
 * away, never mis-routed.
 */
export function zipToLicensedState(zip: string): 'NC' | 'SC' | 'GA' | 'TN' | '' {
  if (!/^\d{5}$/.test(zip)) return ''
  const prefix = Number(zip.slice(0, 3))
  if (prefix >= 270 && prefix <= 289) return 'NC'
  if (prefix >= 290 && prefix <= 299) return 'SC'
  if ((prefix >= 300 && prefix <= 319) || prefix === 398 || prefix === 399) return 'GA'
  if (prefix >= 370 && prefix <= 385) return 'TN'
  return ''
}

type CommercialLead = {
  businessName?: string
  coverageNeed?: string
  industry?: string
  employeeRange?: string
  currentCoverage?: string
  insuranceStatus?: string
  funnelVersion?: string
  claims?: string
  consent?: string
}

/**
 * The human-readable summary appended to the lead on the SERVER, from the
 * validated payload. Never built on the client.
 *
 * The last two lines are the TCPA record: the consent VERSION the visitor
 * accepted, the server's own timestamp for when it was accepted, and the exact
 * wording that was on screen at that version. They mirror composeAutoNotes so
 * both funnels leave the same shape of proof in AgencyZoom.
 *
 * `acceptedAt` is the server's submission timestamp — never a client-supplied
 * one, which a crafted request could backdate.
 *
 * Throws if consent is missing or not the current version. The caller has
 * already rejected such a payload in validateCommercial; this is the second
 * lock, so a future refactor that drops the first cannot quietly produce a
 * consent-bearing note for a lead that never consented.
 */
export function composeCommercialNotes(lead: CommercialLead, leadId: string, acceptedAt: string) {
  if (lead.consent !== COMMERCIAL_CONSENT_VERSION) {
    throw new Error('Refusing to compose commercial notes without valid consent')
  }
  return [
    `JP commercial funnel lead ID: ${leadId}`,
    `Business name: ${lead.businessName || 'Not collected'}`,
    `Coverage requested: ${commercialLabel('coverageNeed', lead.coverageNeed)}`,
    `Industry: ${commercialLabel('industry', lead.industry)}`,
    `Employee range: ${lead.employeeRange ? commercialLabel('employeeRange', lead.employeeRange) : 'Not collected (GL only)'}`,
    `Current coverage: ${commercialLabel('currentCoverage', lead.currentCoverage)}`,
    `Insurance status: ${lead.insuranceStatus ? commercialLabel('insuranceStatus', lead.insuranceStatus) : 'Not collected'}`,
    `Claims (last 3 yrs): ${lead.claims ? commercialLabel('claims', lead.claims) : 'Not collected'}`,
    `Contact consent: ${COMMERCIAL_CONSENT_VERSION}; ${acceptedAt}`,
    COMMERCIAL_CONSENT_TEXT,
  ].join('\n')
}

export function validateCommercial(lead: CommercialLead) {
  for (const key of Object.keys(COMMERCIAL_VALUES) as CommercialField[]) {
    const current = Number((lead.funnelVersion ?? '0').split('.')[0]) >= 5
    if (key === 'claims' && !lead.claims && !current) continue
    if (key === 'insuranceStatus' && !lead.insuranceStatus && !current) continue
    if (key === 'employeeRange' && lead.coverageNeed === 'general_liability' && !lead.employeeRange) continue
    if (!(COMMERCIAL_VALUES[key] as readonly string[]).includes(lead[key] ?? '')) {
      return 'Please complete the business coverage questions.'
    }
  }
  /**
   * Strict equality against the CURRENT version, so this one check rejects all
   * four bad shapes: consent absent, consent sent as some other truthy value
   * ('true', '1', 'yes'), consent carrying a superseded version string after
   * the wording is revised, and consent forged with an invented version. Only
   * the exact version whose text was on screen is accepted.
   */
  if (lead.consent !== COMMERCIAL_CONSENT_VERSION) {
    return CONSENT_REQUIRED_MESSAGE
  }
  return ''
}
