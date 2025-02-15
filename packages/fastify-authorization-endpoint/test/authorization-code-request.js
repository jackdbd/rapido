import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  code_challenge as code_challenge_schema,
  code_challenge_method as code_challenge_method_schema,
  codeChallenge,
  codeVerifier
} from '@jackdbd/pkce'
import { defAjv } from '@repo/stdlib/test-utils'
import { nanoid } from 'nanoid'
import { authorization_request_querystring } from '../lib/schemas/requests.js'

const ajv = defAjv({
  allErrors: true,
  schemas: [code_challenge_schema, code_challenge_method_schema]
})

describe('authorization code request querystring', () => {
  it('must include: client_id, code_challenge, code_challenge_method, me, redirect_uri, response_type=code, state', (t) => {
    const validate = ajv.compile(authorization_request_querystring)

    const me = canonicalUrl('end-user.com')
    const client_id = canonicalUrl('micropub-client.com')
    const redirect_uri = canonicalUrl(`${client_id}auth/callback`)
    const code_verifier = codeVerifier({ len: 43 })
    const code_challenge_method = 'S256'
    const code_challenge = codeChallenge({
      code_verifier,
      method: code_challenge_method
    })
    const response_type = 'code'
    const state = nanoid()

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code_challenge })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code_challenge, code_challenge_method })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code_challenge, code_challenge_method, me })
    t.assert.ok(validate.errors.length >= 1)

    validate({
      client_id,
      code_challenge,
      code_challenge_method,
      me,
      redirect_uri
    })
    t.assert.ok(validate.errors.length >= 1)

    validate({
      client_id,
      code_challenge,
      code_challenge_method,
      me,
      redirect_uri,
      response_type
    })
    t.assert.ok(validate.errors.length >= 1)

    validate({
      client_id,
      code_challenge,
      code_challenge_method,
      me,
      redirect_uri,
      response_type,
      state
    })

    t.assert.equal(validate.errors, null)
  })
})
