import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  code_challenge as code_challenge_schema,
  code_challenge_method as code_challenge_method_schema,
  codeVerifier
} from '@jackdbd/pkce'
import { defAjv } from '@repo/stdlib/test-utils'
import { nanoid } from 'nanoid'
import { access_token_request_body } from '../lib/schemas/requests.js'

const ajv = defAjv({
  allErrors: true,
  schemas: [code_challenge_schema, code_challenge_method_schema]
})

describe('access token request body', () => {
  it('must include: client_id, code, code_verifier, grant_type=authorization_code, redirect_uri', (t) => {
    const validate = ajv.compile(access_token_request_body)

    const client_id = canonicalUrl('micropub-client.com')
    const code = nanoid(32)
    const code_verifier = codeVerifier({ len: 43 })
    const grant_type = 'authorization_code'
    const redirect_uri = canonicalUrl(`${client_id}auth/callback`)

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code, code_verifier })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code, code_verifier, grant_type })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, code, code_verifier, grant_type, redirect_uri })
    t.assert.equal(validate.errors, null)
  })
})
