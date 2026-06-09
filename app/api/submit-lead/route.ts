import { NextRequest, NextResponse } from 'next/server'

const JOTFORM_FORM_ID = '261496542238059'
const JOTFORM_URL = `https://submit.jotform.com/submit/${JOTFORM_FORM_ID}/`

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const {
    firstName = '',
    lastName = '',
    phone = '',
    email = '',
    coverageLabel = '',
    situation = '',
    urgency = '',
    notes = '',
    source = '',
  } = body

  if (!phone.trim()) {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
  }

  const submissionDate = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  const params = new URLSearchParams({
    formID: JOTFORM_FORM_ID,
    'q2_q2_fullname0[first]': firstName.trim(),
    'q2_q2_fullname0[last]':  lastName.trim(),
    'q3_q3_phone1[full]':     phone.trim(),
    q4_q4_email2:             email.trim(),
    q5_q5_dropdown3:          coverageLabel,
    q6_q6_dropdown4:          situation,
    q7_q7_dropdown5:          urgency,
    q8_q8_textarea6:          notes.trim(),
    q10_leadSource:           source,
    q11_submissionDate:       submissionDate,
  })

  try {
    const res = await fetch(JOTFORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'follow',
    })

    if (res.status >= 500) {
      return NextResponse.json(
        { error: 'Submission service unavailable. Please call (866) 786-1585.' },
        { status: 502 },
      )
    }

    // Jotform returns 200 even for validation failures — detect via response body
    const text = await res.text()
    if (text.includes('submission-error') || text.includes('Incomplete Values')) {
      return NextResponse.json(
        { error: 'Submission validation failed. Please check all required fields.' },
        { status: 422 },
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Could not reach submission service. Please call (866) 786-1585.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true })
}
