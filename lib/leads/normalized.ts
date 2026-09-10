import type { LeadPayload } from '@/lib/leadValidation'

export const JP_INSURANCE_TYPES = ['auto', 'life', 'commercial_gl_wc'] as const
export type JPInsuranceType = (typeof JP_INSURANCE_TYPES)[number]
export type AgencyZoomHandoffStatus = 'pending' | 'dry_run' | 'accepted' | 'failed' | 'not_configured'

export type JPAttribution = {
  source: string
  platform: string
  campaign_id: string
  content_id: string
  ad_id: string
  batch_id: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  referral_source: string
  referral_host: string
}

export type NormalizedJPLead = {
  lead_id: string
  funnel_id: string
  funnel_version: string
  insurance_type: JPInsuranceType
  first_name: string
  last_name: string
  phone: string
  email: string
  state: string
  zip: string
  attribution: JPAttribution
  funnel_answers: Record<string, string>
  qualification_data: Record<string, string>
  submitted_at: string
  agencyzoom_handoff_status: AgencyZoomHandoffStatus
  agencyzoom_lead_id?: number
  downstream: {
    coverage_label: string
    situation: string
    urgency: string
    notes: string
    home_ownership: string
  }
}

const clean = (value: string | undefined, limit = 160) => (value ?? '').trim().slice(0, limit)

export function normalizeJPLead(lead: LeadPayload, leadId: string, submittedAt: string): NormalizedJPLead {
  const insuranceType = (lead.product === 'commercial' ? 'commercial_gl_wc' : lead.product) as JPInsuranceType
  if (!JP_INSURANCE_TYPES.includes(insuranceType)) throw new Error('Unsupported JP insurance type')

  const funnelAnswers: Record<string, string> = {}
  const qualificationData: Record<string, string> = {}
  for (const key of ['insured', 'timing', 'vehicles', 'driving', 'bundle', 'consent', 'homeOwnership', 'coverageNeed', 'industry', 'employeeRange'] as const) {
    const value = clean(lead[key])
    if (value) funnelAnswers[key] = value
  }
  for (const key of ['businessName', 'coverageNeed', 'industry', 'employeeRange'] as const) {
    const value = clean(lead[key])
    if (value) qualificationData[key] = value
  }

  return {
    lead_id: leadId,
    funnel_id: clean(lead.funnelId) || insuranceType,
    funnel_version: clean(lead.funnelVersion) || '1.0.0',
    insurance_type: insuranceType,
    first_name: lead.firstName,
    last_name: lead.lastName,
    phone: lead.phone,
    email: lead.email,
    state: lead.state,
    zip: lead.zip,
    attribution: {
      source: clean(lead.trafficSource || lead.source),
      platform: clean(lead.platform),
      campaign_id: clean(lead.campaignId),
      content_id: clean(lead.contentId),
      ad_id: clean(lead.adId),
      batch_id: clean(lead.batchId),
      utm_source: clean(lead.utmSource),
      utm_medium: clean(lead.utmMedium),
      utm_campaign: clean(lead.utmCampaign),
      utm_content: clean(lead.utmContent),
      utm_term: clean(lead.utmTerm),
      referral_source: clean(lead.referralSource),
      referral_host: clean(lead.referralHost),
    },
    funnel_answers: funnelAnswers,
    qualification_data: qualificationData,
    submitted_at: submittedAt,
    agencyzoom_handoff_status: 'pending',
    downstream: {
      coverage_label: lead.coverageLabel,
      situation: lead.situation,
      urgency: lead.urgency,
      notes: lead.notes,
      home_ownership: clean(lead.homeOwnership),
    },
  }
}
