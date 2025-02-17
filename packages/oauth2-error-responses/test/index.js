import { describe, it } from 'node:test'
import { nanoid } from 'nanoid'
import {
  InvalidRequestError,
  InvalidScopeError,
  ServerError,
  TemporaryUnavailableError,
  oauth2ErrorFromErrorString
} from '../lib/index.js'

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

describe('oauth2ErrorFromErrorString', () => {
  it(`returns an instance of InvalidScopeError if the error string is 'invalid_scope'`, (t) => {
    const err = oauth2ErrorFromErrorString('invalid_scope')
    t.assert.ok(err instanceof InvalidScopeError)
  })

  it(`has the expected status code and error string, and the provided error_description, error_uri and state`, (t) => {
    const error = 'temporarily_unavailable'
    const error_description =
      'Down for maintenance. Please try again in a few seconds.'
    const error_uri = `https://example.com/${nanoid()}`
    const state = nanoid()

    const err = oauth2ErrorFromErrorString(error, {
      error_description,
      error_uri,
      state
    })

    t.assert.ok(err instanceof TemporaryUnavailableError)
    t.assert.strictEqual(err.statusCode, 503)
    t.assert.strictEqual(err.error, error)
    t.assert.strictEqual(err.error_description, error_description)
    t.assert.strictEqual(err.error_uri, error_uri)
    t.assert.strictEqual(err.state, state)
  })
})
