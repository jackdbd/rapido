import { describe, it } from 'node:test'
import assert from 'node:assert'
import { defAjv } from '@repo/stdlib/test-utils'
import {
  iso8601,
  rfc3339,
  unixTimestampInMs,
  unixTimestampInSeconds
} from '../../indieauth/lib/date.js'
import { date } from '../lib/index.js'

const ajv = defAjv()

describe('date', () => {
  it('cannot be an empty string', () => {
    const valid = ajv.validate(date, '')
    assert.strictEqual(valid, false)
  })

  it(`cannot be the string 'foo'`, () => {
    const valid = ajv.validate(date, 'foo')
    assert.strictEqual(valid, false)
  })

  it('can be YYYY-MM-DD without a time zone', () => {
    const valid = ajv.validate(date, '2013-06-30')
    assert.strictEqual(valid, true)
  })

  it('can be YYYY-MM-DD hh:mm:ss without a time zone', () => {
    const valid = ajv.validate(date, '2013-06-30 18:00:00')
    assert.strictEqual(valid, true)
  })

  it('cannot be YYYY-MM-DDThh:mm:ss with a time zone notation', () => {
    const valid = ajv.validate(date, '2013-06-30T18:00:00 Europe/Rome')
    assert.strictEqual(valid, false)
  })

  it('can be YYYY-MM-DD hh:mm:ss with an offset notation', () => {
    const valid = ajv.validate(date, '2013-06-30 18:00:00+02:00')
    assert.strictEqual(valid, true)
  })

  it('can be the current time formatted as ISO 8601', () => {
    const valid = ajv.validate(date, iso8601())
    assert.strictEqual(valid, true)
  })

  it('can be the current time formatted as RFC 3339', () => {
    const valid = ajv.validate(date, rfc3339())
    assert.strictEqual(valid, true)
  })

  it('cannot be a UNIX timestamp (in ms)', () => {
    const valid = ajv.validate(date, unixTimestampInMs())
    assert.strictEqual(valid, false)
  })

  it('cannot be a UNIX timestamp (in seconds)', () => {
    const valid = ajv.validate(date, unixTimestampInSeconds())
    assert.strictEqual(valid, false)
  })
})
