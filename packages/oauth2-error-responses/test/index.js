import { describe, it } from 'node:test'
import { InvalidRequestError, ServerError } from '../lib/index.js'

describe('InvalidRequestError', () => {
  it('has status code 400', (t) => {
    const error_description = 'Some client error'
    const err = new InvalidRequestError({ error_description })

    t.assert.equal(err.statusCode, 400)
  })

  it('has a payload with `error` but no `error_description` by default', (t) => {
    const error_description = 'Some client error'
    const err = new InvalidRequestError({ error_description })

    const payload = err.payload()

    t.assert.ok(payload.error)
    t.assert.equal(payload.error_description, undefined)
  })

  it('has a payload with `error` and also `error_description` if option include_error_description is true', (t) => {
    const error_description = 'Some client error'
    const err = new InvalidRequestError({ error_description })

    const payload = err.payload({ include_error_description: true })

    t.assert.ok(payload.error)
    t.assert.equal(payload.error_description, error_description)
  })
})

describe('ServerError', () => {
  it('has status code 500', (t) => {
    const error_description = 'Some client error'
    const err = new ServerError({ error_description })

    t.assert.equal(err.statusCode, 500)
  })
})
