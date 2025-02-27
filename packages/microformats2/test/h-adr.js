import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib'
import {
  h_adr,
  h_geo,
  p_altitude,
  p_geo,
  p_latitude,
  p_longitude
} from '../lib/index.js'

const ajv = defAjv({
  allErrors: true,
  schemas: [p_altitude, p_geo, h_geo, p_latitude, p_longitude, h_adr]
})

// const validate = ajv.compile(h_adr);
const validate = ajv.getSchema(h_adr.$id)

describe('h_adr', () => {
  it('can be an empty objects, since all properties are optional', () => {
    const valid = validate({})
    assert(valid)
    assert(validate.errors === null)
  })

  it('can have altitude, latitude, longitude', () => {
    const valid = validate({
      altitude: 100,
      latitude: -43,
      longitude: 55
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be an address', () => {
    const valid = validate({
      'street-address': '17 Austerstræti',
      locality: 'Reykjavík',
      'country-name': 'Iceland',
      'postal-code': '107'
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a geo object', () => {
    const valid = validate({
      geo: {
        latitude: 64.128288,
        locality: 'Reykjavík',
        longitude: -21.827774
      }
    })
    assert(valid)
    assert(validate.errors === null)
  })

  it('can be a geo URI', () => {
    const valid = validate({ geo: 'geo:37.786971,-122.399677;u=35' })
    assert(valid)
    assert(validate.errors === null)
  })
})
