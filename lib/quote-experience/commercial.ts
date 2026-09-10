export const COMMERCIAL_VALUES = {
  coverageNeed: ['both', 'general_liability', 'workers_comp', 'unsure'],
  industry: ['contractor', 'retail', 'professional', 'restaurant', 'other'],
  employeeRange: ['1', '5', '11', '26'],
} as const

const labels: Record<string, string> = {
  both: 'General Liability and Workers Comp', general_liability: 'General Liability', workers_comp: 'Workers Comp', unsure: 'Needs guidance',
  contractor: 'Contractor / trade', retail: 'Retail', professional: 'Professional service', restaurant: 'Food / hospitality', other: 'Other',
  '1': '1-4', '5': '5-10', '11': '11-25', '26': '26+',
}

export function composeCommercialNotes(lead: { businessName?: string; coverageNeed?: string; industry?: string; employeeRange?: string }, leadId: string) {
  return [
    `JP commercial funnel lead ID: ${leadId}`,
    `Business name: ${lead.businessName ?? ''}`,
    `Coverage requested: ${labels[lead.coverageNeed ?? ''] ?? lead.coverageNeed ?? ''}`,
    `Industry: ${labels[lead.industry ?? ''] ?? lead.industry ?? ''}`,
    `Employee range: ${labels[lead.employeeRange ?? ''] ?? lead.employeeRange ?? ''}`,
  ].join('\n')
}

export function validateCommercial(lead: { businessName?: string; coverageNeed?: string; industry?: string; employeeRange?: string }) {
  if (!lead.businessName?.trim()) return 'Please enter your business name.'
  for (const key of Object.keys(COMMERCIAL_VALUES) as Array<keyof typeof COMMERCIAL_VALUES>) {
    if (!(COMMERCIAL_VALUES[key] as readonly string[]).includes(lead[key] ?? '')) return 'Please complete the business coverage questions.'
  }
  return ''
}
