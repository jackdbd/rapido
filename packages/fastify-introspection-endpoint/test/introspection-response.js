import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import { defAjv } from '@repo/stdlib'
import { nanoid } from 'nanoid'
import {
  introspection_response_body_when_token_is_not_retrieved,
  introspection_response_body_when_token_is_retrieved
} from '../lib/schemas/responses.js'

const ajv = defAjv({ allErrors: true, schemas: [] })

describe('introspection response body (token not retrieved)', () => {
  it('must include: active', (t) => {
    const validate = ajv.compile(
      introspection_response_body_when_token_is_not_retrieved
    )

    const active = false

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ active })
    t.assert.equal(validate.errors, null)
  })
})

describe('introspection response body (token retrieved)', () => {
  it('must include: active, client_id, me, scope', (t) => {
    const validate = ajv.compile(
      introspection_response_body_when_token_is_retrieved
    )

    const active = true
    const client_id = canonicalUrl('micropub-client.com')
    const me = canonicalUrl('giacomdebidda.com')
    const scope = 'create update profile email'

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ active })
    t.assert.ok(validate.errors.length >= 1)

    validate({ active, client_id })
    t.assert.ok(validate.errors.length >= 1)

    validate({ active, client_id, me })
    t.assert.ok(validate.errors.length >= 1)

    validate({ active, client_id, me, scope })
    t.assert.equal(validate.errors, null)
  })

  it('can include: exp, iat, iss, jti', (t) => {
    const validate = ajv.compile(
      introspection_response_body_when_token_is_retrieved
    )

    const active = true
    const client_id = canonicalUrl('micropub-client.com')
    const exp = unixTimestampInSeconds() + 3600
    const iat = unixTimestampInSeconds()
    const iss = canonicalUrl('authorization-server.com')
    const jti = nanoid()
    const me = canonicalUrl('giacomdebidda.com')
    const scope = 'create update profile email'

    validate({ active, client_id, exp, iat, iss, jti, me, scope })
    t.assert.equal(validate.errors, null)
  })
})
