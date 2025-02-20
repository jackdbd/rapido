import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib/test-utils'
import { p_altitude, p_latitude, p_longitude, p_geo } from '../lib/index.js'

const ajv = defAjv()

describe('altitude', () => {
  it('has the expected $id', () => {
    assert.strictEqual(p_altitude.$id, 'p-altitude')
  })

  it('can be a negative number', () => {
    const valid = ajv.validate(p_altitude, -100)
    assert.strictEqual(valid, true)
  })
})

describe('latitude', () => {
  it('has the expected $id', () => {
    assert.strictEqual(p_latitude.$id, 'p-latitude')
  })

  it('is a number in the range [-90; 90]', () => {
    assert.strictEqual(ajv.validate(p_latitude, -91), false)
    assert.strictEqual(ajv.validate(p_latitude, -90), true)
    assert.strictEqual(ajv.validate(p_latitude, 90), true)
    assert.strictEqual(ajv.validate(p_latitude, 91), false)
  })
})

describe('longitude', async () => {
  it('has the expected $id', () => {
    assert.strictEqual(p_longitude.$id, 'p-longitude')
  })

  it('is a number in the range [-180; 180]', () => {
    assert.strictEqual(ajv.validate(p_longitude, -181), false)
    assert.strictEqual(ajv.validate(p_longitude, -180), true)
    assert.strictEqual(ajv.validate(p_longitude, 180), true)
    assert.strictEqual(ajv.validate(p_longitude, 181), false)
  })
})

describe('geo-uri', async () => {
  it('has the expected $id', () => {
    assert.strictEqual(p_geo.$id, 'p-geo')
  })

  it('is not any string', () => {
    const valid = ajv.validate(p_geo, 'foobar')
    assert.strictEqual(valid, false)

    const validate = ajv.compile(p_geo)
    const is_valid = validate('foobar')
    assert.ok(!is_valid)
    assert(validate.errors.length > 0)
  })

  it('is a string defined in RFC 5870', () => {
    assert.strictEqual(
      ajv.validate(p_geo, 'geo:37.786971,-122.399677;u=35'),
      true
    )
  })
})
