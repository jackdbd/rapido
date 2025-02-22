import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { defAjv } from '@repo/stdlib'
import { nanoid } from 'nanoid'
import { authorization_response_querystring } from '../lib/schemas/responses.js'

const ajv = defAjv({ allErrors: true, schemas: [] })

describe('authorization code response querystring success', () => {
  it('must include: code, state', (t) => {
    const validate = ajv.compile(authorization_response_querystring)

    const code = nanoid(32)
    const state = nanoid()

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ code })
    t.assert.ok(validate.errors.length >= 1)

    validate({ code, state })
    t.assert.equal(validate.errors, null)
  })

  it('can include: iss (URL)', (t) => {
    const validate = ajv.compile(authorization_response_querystring)

    const code = nanoid(32)
    const state = nanoid()
    const iss = canonicalUrl('authorization-server.com')

    validate({ code, state, iss })
    t.assert.equal(validate.errors, null)
  })
})
