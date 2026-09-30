import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lifeFunnel } from '@/funnels/life'
import { PRODUCT_REQUIRED_ANSWERS, validateProductAnswers } from '@/lib/quote-experience/products'
import {
  HOME_OWNERSHIP_VALUES,
  isValidOptionalHomeOwnership,
  normalizeHomeOwnership,
  type LeadPayload,
} from '@/lib/leadValidation'

/**
 * The funnel shape itself is a product decision that was locked. These tests
 * exist so a future "small addition" fails loudly instead of shipping.
 */
describe('locked Life funnel shape', () => {
  it('asks exactly five questions', () => {
    assert.equal(lifeFunnel.steps.length, 5)
  })

  it('asks them in the approved order', () => {
    assert.deepEqual(
      lifeFunnel.steps.map((step) => step.id),
      ['fullName', 'state', 'zip', 'homeOwnership', 'contact'],
    )
  })

  it('ends on the combined contact screen', () => {
    const last = lifeFunnel.steps[lifeFunnel.steps.length - 1]
    assert.equal(last.kind, 'contact')
  })

  it('has no separate phone or email step', () => {
    // Phone and email are two inputs on one screen, never two screens.
    const ids = lifeFunnel.steps.map((step) => step.id)
    assert.ok(!ids.includes('phone'))
    assert.ok(!ids.includes('email'))
  })

  it('contains none of the deferred underwriting questions', () => {
    const banned = [
      'dateOfBirth',
      'dob',
      'gender',
      'sex',
      'tobacco',
      'health',
      'coverageAmount',
      'maritalStatus',
      'children',
      'income',
      'employment',
    ]
    const ids = lifeFunnel.steps.map((step) => step.id.toLowerCase())
    for (const id of banned) {
      assert.ok(!ids.includes(id.toLowerCase()), `funnel must not ask "${id}"`)
    }
  })

  it('labels the final action as a submission, not "Continue"', () => {
    const last = lifeFunnel.steps[lifeFunnel.steps.length - 1]
    assert.equal(last.kind, 'contact')
    if (last.kind === 'contact') {
      assert.equal(last.submitLabel, 'Submit Request')
    }
  })

  it('offers exactly Own and Rent', () => {
    const step = lifeFunnel.steps[3]
    assert.equal(step.kind, 'choice')
    if (step.kind === 'choice') {
      assert.deepEqual(step.options.map((option) => option.value), ['Own', 'Rent'])
    }
  })

  it('registers itself for server-side required-answer enforcement', () => {
    // A funnel the server does not know about cannot enforce its extra fields.
    assert.ok(PRODUCT_REQUIRED_ANSWERS[lifeFunnel.id])
  })
})

describe('home ownership normalization', () => {
  it('accepts the canonical values', () => {
    for (const value of HOME_OWNERSHIP_VALUES) {
      assert.equal(normalizeHomeOwnership(value), value)
    }
  })

  it('normalizes casing rather than rejecting it', () => {
    assert.equal(normalizeHomeOwnership('own'), 'Own')
    assert.equal(normalizeHomeOwnership('RENT'), 'Rent')
  })

  it('discards anything outside the enum', () => {
    assert.equal(normalizeHomeOwnership('Squatting'), '')
    assert.equal(normalizeHomeOwnership('<script>alert(1)</script>'), '')
    assert.equal(normalizeHomeOwnership(undefined), '')
    assert.equal(normalizeHomeOwnership(42), '')
  })

  it('permits an absent value for the legacy site forms', () => {
    assert.ok(isValidOptionalHomeOwnership(''))
    assert.ok(!isValidOptionalHomeOwnership('Maybe'))
  })
})

describe('server-side product enforcement', () => {
  const base: LeadPayload = {
    firstName: 'Jane',
    lastName: 'Public',
    phone: '7045550142',
    email: '',
    state: 'NC',
    zip: '28205',
    coverageLabel: 'Life Insurance',
    situation: '',
    urgency: '',
    notes: '',
    source: 'Life Quote Funnel',
  }

  it('ignores payloads with no product — the legacy forms', () => {
    assert.equal(validateProductAnswers(base), '')
  })

  it('rejects a Life lead with no ownership answer', () => {
    assert.notEqual(validateProductAnswers({ ...base, product: 'life' }), '')
  })

  it('accepts a complete Life lead', () => {
    assert.equal(
      validateProductAnswers({ ...base, product: 'life', homeOwnership: 'Own' }),
      '',
    )
  })

  it('rejects an unknown product id', () => {
    // A client/server version mismatch must not deliver an unvalidated lead.
    assert.notEqual(validateProductAnswers({ ...base, product: 'spaceship' }), '')
  })
})
