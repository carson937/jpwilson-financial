import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { zipToLicensedState } from '@/lib/quote-experience/commercial'

describe('zipToLicensedState', () => {
  it('places a business ZIP in the right licensed state', () => {
    assert.equal(zipToLicensedState('27601'), 'NC') // Raleigh
    assert.equal(zipToLicensedState('28205'), 'NC') // Charlotte
    assert.equal(zipToLicensedState('28909'), 'NC') // far-west NC
    assert.equal(zipToLicensedState('29201'), 'SC') // Columbia
    assert.equal(zipToLicensedState('29948'), 'SC')
    assert.equal(zipToLicensedState('30301'), 'GA') // Atlanta
    assert.equal(zipToLicensedState('31401'), 'GA') // Savannah
    assert.equal(zipToLicensedState('39901'), 'GA') // Atlanta AP
    assert.equal(zipToLicensedState('37201'), 'TN') // Nashville
    assert.equal(zipToLicensedState('38501'), 'TN') // Cookeville
  })

  it('turns away anything outside NC/SC/GA/TN', () => {
    assert.equal(zipToLicensedState('90210'), '') // CA
    assert.equal(zipToLicensedState('10001'), '') // NY
    assert.equal(zipToLicensedState('33101'), '') // FL
    assert.equal(zipToLicensedState('35201'), '') // AL
    assert.equal(zipToLicensedState('38601'), '') // MS (just past TN)
    assert.equal(zipToLicensedState('24201'), '') // VA (just past NC)
    assert.equal(zipToLicensedState('00000'), '')
  })

  it('rejects anything that is not five digits', () => {
    assert.equal(zipToLicensedState(''), '')
    assert.equal(zipToLicensedState('2820'), '')
    assert.equal(zipToLicensedState('282055'), '')
    assert.equal(zipToLicensedState('2820a'), '')
    assert.equal(zipToLicensedState('28205-1234'), '')
  })
})
