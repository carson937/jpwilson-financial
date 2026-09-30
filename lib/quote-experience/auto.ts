/** Closed, coarse qualification values only. No driver, claim, VIN or license details. */
export const AUTO_VALUES = {
  insured: ['yes', 'no'],
  timing: ['now', '30_days', '90_days', 'researching'],
  vehicles: ['1', '2', '3', '4_plus'],
  driving: ['none', 'some', 'discuss'],
  bundle: ['', 'home', 'renters', 'no', 'unsure'],
} as const

export type AutoField = keyof typeof AUTO_VALUES
export type AutoQualification = Record<AutoField, string>
export const AUTO_CONSENT_VERSION = 'auto-contact-v1'
export const AUTO_CONSENT_TEXT = 'I agree that JP Wilson Financial Group may contact me by phone, text, or email about this insurance request. Consent is not a condition of purchase.'

export function validAutoValue(field: AutoField, value: unknown): value is string {
  return typeof value === 'string' && (AUTO_VALUES[field] as readonly string[]).includes(value)
}

export function validateAuto(answers: Partial<AutoQualification>, consent: string | undefined): string {
  for (const field of Object.keys(AUTO_VALUES) as AutoField[]) {
    if (!validAutoValue(field, answers[field] ?? '')) return 'Please complete the auto insurance questions.'
  }
  return consent === AUTO_CONSENT_VERSION ? '' : 'Please agree to contact about your request before submitting.'
}

/** User-approved V1 assumption: existing notes path, no new Jotform/Zap fields. */
export function composeAutoNotes(answers: AutoQualification, requestId: string, acceptedAt: string): string {
  if (validateAuto(answers, AUTO_CONSENT_VERSION)) throw new Error('Invalid auto qualification')
  return [
    'Auto Quote Funnel v1',
    `Currently insured: ${answers.insured}`,
    `${answers.insured === 'yes' ? 'Renewal' : 'Start'} timing: ${answers.timing}`,
    `Vehicle count: ${answers.vehicles}`,
    `Driving history (past 5 years, coarse self-report): ${answers.driving}`,
    `Bundle interest: ${answers.bundle || 'not provided'}`,
    `Contact consent: ${AUTO_CONSENT_VERSION}; ${acceptedAt}`,
    AUTO_CONSENT_TEXT,
    `Request reference: ${requestId}`,
  ].join(' | ')
}
