import { describe, it } from 'node:test'
import { defAjv } from '@repo/stdlib'
import { nanoid } from 'nanoid'
import { introspection_request_body } from '../lib/schemas/requests.js'

const ajv = defAjv({ allErrors: true, schemas: [] })

describe('introspection request body', () => {
  it('requires token, while token_type_hint is optional', (t) => {
    const validate = ajv.compile(introspection_request_body)

    const token = nanoid()

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ token })
    t.assert.equal(validate.errors, null)
  })

  it('allows token_type_hint=access_token and token_type_hint=refresh_token', (t) => {
    const validate = ajv.compile(introspection_request_body)

    const token = nanoid()

    validate({ token, token_type_hint: 'foo' })
    t.assert.ok(validate.errors.length >= 1)

    validate({ token, token_type_hint: 'access_token' })
    t.assert.equal(validate.errors, null)

    validate({ token, token_type_hint: 'refresh_token' })
    t.assert.equal(validate.errors, null)
  })
})
