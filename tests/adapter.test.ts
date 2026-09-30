import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  HOME_OWNERSHIP_NOTE_PREFIX,
  buildLeadFromAnswers,
  composeNotes,
} from '@/lib/quote-experience/adapter'
import { lifeFunnel } from '@/funnels/life'

/**
 * The adapter is the seam between a funnel and the proven Jotform/Zapier path.
 * A regression here does not throw — it delivers a subtly wrong lead into the
 * CRM. These assertions are the reason that cannot happen quietly.
 */

const COMPLETE_ANSWERS = {
  fullName: 'Jane Q Public',
  state: 'NC',
  zip: '28205',
  homeOwnership: 'Own',
  phone: '(704) 555-0142',
  email: 'jane@example.com',
}

describe('buildLeadFromAnswers', () => {
  it('maps every funnel answer to its payload field', () => {
    const lead = lifeFunnel.toLead(COMPLETE_ANSWERS)

    assert.equal(lead.firstName, 'Jane')
    assert.equal(lead.lastName, 'Q Public')
    assert.equal(lead.phone, '(704) 555-0142')
    assert.equal(lead.email, 'jane@example.com')
    assert.equal(lead.state, 'NC')
    assert.equal(lead.zip, '28205')
    assert.equal(lead.homeOwnership, 'Own')
    assert.equal(lead.product, 'life')
  })

  it('sends the exact Jotform coverage value, not the display label', () => {
    // q5 on form 261496542238059 offers precisely this string. A reworded
    // display label must never reach the payload.
    assert.equal(lifeFunnel.toLead(COMPLETE_ANSWERS).coverageLabel, 'Life Insurance')
  })

  it('identifies the funnel as its own lead source', () => {
    assert.equal(lifeFunnel.toLead(COMPLETE_ANSWERS).source, 'Life Quote Funnel')
  })

  it('leaves situation and urgency empty rather than inventing answers', () => {
    // The locked funnel asks neither question. Fabricating a value would put
    // data JP reads as the visitor's own words into the CRM.
    const lead = lifeFunnel.toLead(COMPLETE_ANSWERS)
    assert.equal(lead.situation, '')
    assert.equal(lead.urgency, '')
  })

  it('does not compose notes on the client', () => {
    // The structured line is appended server-side from the validated enum.
    assert.equal(lifeFunnel.toLead(COMPLETE_ANSWERS).notes, '')
  })

  it('keeps a single-word name intact without inventing a surname', () => {
    const lead = lifeFunnel.toLead({ ...COMPLETE_ANSWERS, fullName: 'Cher' })
    assert.equal(lead.firstName, 'Cher')
    assert.equal(lead.lastName, '')
  })

  it('treats every name part after the first as the surname', () => {
    const lead = lifeFunnel.toLead({ ...COMPLETE_ANSWERS, fullName: 'Ana Maria de la Cruz' })
    assert.equal(lead.firstName, 'Ana')
    assert.equal(lead.lastName, 'Maria de la Cruz')
  })

  it('yields empty strings, never undefined, for missing answers', () => {
    const lead = buildLeadFromAnswers({}, {
      product: 'life',
      coverageLabel: 'Life Insurance',
      source: 'Life Quote Funnel',
    })

    assert.equal(lead.phone, '')
    assert.equal(lead.email, '')
    assert.equal(lead.state, '')
    assert.equal(lead.zip, '')
    assert.equal(lead.homeOwnership, '')
  })
})

describe('composeNotes', () => {
  it('appends the labelled home-ownership line', () => {
    assert.equal(composeNotes('', 'Own'), `${HOME_OWNERSHIP_NOTE_PREFIX} Own`)
    assert.equal(composeNotes('', 'Rent'), `${HOME_OWNERSHIP_NOTE_PREFIX} Rent`)
  })

  it('preserves a visitor note and puts it first', () => {
    assert.equal(
      composeNotes('Call after 6pm', 'Rent'),
      `Call after 6pm | ${HOME_OWNERSHIP_NOTE_PREFIX} Rent`,
    )
  })

  it('stays empty when there is nothing to say', () => {
    // The legacy forms send no ownership value; their notes must be unchanged.
    assert.equal(composeNotes('', ''), '')
  })

  it('does not alter a legacy note when no ownership is present', () => {
    assert.equal(composeNotes('Existing note', ''), 'Existing note')
  })
})
