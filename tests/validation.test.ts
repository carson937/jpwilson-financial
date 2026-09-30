import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateAllSteps, validateStep } from '@/lib/quote-experience/validation'
import type { ChoiceStep, ContactStep, StateStep, TextStep, ZipStep } from '@/lib/quote-experience/types'
import { lifeFunnel } from '@/funnels/life'

const nameStep = lifeFunnel.steps[0] as TextStep
const stateStep = lifeFunnel.steps[1] as StateStep
const zipStep = lifeFunnel.steps[2] as ZipStep
const ownRentStep = lifeFunnel.steps[3] as ChoiceStep
const contactStep = lifeFunnel.steps[4] as ContactStep

describe('step validation', () => {
  it('requires a name with an actual letter in it', () => {
    assert.notEqual(validateStep(nameStep, {}), '')
    assert.notEqual(validateStep(nameStep, { fullName: '   ' }), '')
    assert.notEqual(validateStep(nameStep, { fullName: '---' }), '')
    assert.equal(validateStep(nameStep, { fullName: 'Jane Public' }), '')
  })

  it('accepts only a licensed state', () => {
    assert.notEqual(validateStep(stateStep, {}), '')
    // Licensed list is NC, SC, GA, TN — anything else must not pass.
    assert.notEqual(validateStep(stateStep, { state: 'CA' }), '')
    assert.equal(validateStep(stateStep, { state: 'NC' }), '')
    assert.equal(validateStep(stateStep, { state: 'GA' }), '')
  })

  it('requires exactly five ZIP digits', () => {
    assert.notEqual(validateStep(zipStep, { zip: '' }), '')
    assert.notEqual(validateStep(zipStep, { zip: '282' }), '')
    assert.equal(validateStep(zipStep, { zip: '28205' }), '')
  })

  it('preserves a leading-zero ZIP', () => {
    // Truncating "01001" to a number would silently relocate the lead.
    assert.equal(validateStep(zipStep, { zip: '01001' }), '')
  })

  it('accepts only a declared choice value', () => {
    assert.notEqual(validateStep(ownRentStep, {}), '')
    assert.notEqual(validateStep(ownRentStep, { homeOwnership: 'Maybe' }), '')
    assert.equal(validateStep(ownRentStep, { homeOwnership: 'Own' }), '')
    assert.equal(validateStep(ownRentStep, { homeOwnership: 'Rent' }), '')
  })
})

describe('contact step', () => {
  it('requires a phone number', () => {
    assert.notEqual(validateStep(contactStep, {}), '')
    assert.notEqual(validateStep(contactStep, { phone: '' }), '')
  })

  it('rejects a phone number that is not a real US number', () => {
    assert.notEqual(validateStep(contactStep, { phone: '123' }), '')
    assert.notEqual(validateStep(contactStep, { phone: 'not a phone' }), '')
    // Ten identical digits is the classic junk entry.
    assert.notEqual(validateStep(contactStep, { phone: '5555555555' }), '')
  })

  it('accepts a valid US phone in any common format', () => {
    assert.equal(validateStep(contactStep, { phone: '(704) 555-0142' }), '')
    assert.equal(validateStep(contactStep, { phone: '7045550142' }), '')
    assert.equal(validateStep(contactStep, { phone: '1-704-555-0142' }), '')
  })

  it('treats email as genuinely optional', () => {
    assert.equal(validateStep(contactStep, { phone: '7045550142' }), '')
    assert.equal(validateStep(contactStep, { phone: '7045550142', email: '' }), '')
  })

  it('validates email only once one is supplied', () => {
    assert.notEqual(
      validateStep(contactStep, { phone: '7045550142', email: 'not-an-email' }),
      '',
    )
    assert.equal(
      validateStep(contactStep, { phone: '7045550142', email: 'jane@example.com' }),
      '',
    )
  })
})

describe('validateAllSteps', () => {
  const complete = {
    fullName: 'Jane Public',
    state: 'NC',
    zip: '28205',
    homeOwnership: 'Own',
    phone: '7045550142',
  }

  it('passes a fully answered funnel', () => {
    assert.equal(validateAllSteps(lifeFunnel.steps, complete), '')
  })

  it('catches a skipped step even when the last screen is valid', () => {
    // The guard that stops a crafted request from submitting a half-funnel.
    const { homeOwnership, ...missingOwnership } = complete
    assert.notEqual(validateAllSteps(lifeFunnel.steps, missingOwnership), '')

    const { state, ...missingState } = complete
    assert.notEqual(validateAllSteps(lifeFunnel.steps, missingState), '')
  })
})
