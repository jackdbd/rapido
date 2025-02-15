import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { codeVerifier } from '@jackdbd/pkce'
import { defAjv } from '@repo/stdlib/test-utils'
import { nanoid } from 'nanoid'
import { access_token_request_body } from '../lib/schemas/requests.js'

const ajv = defAjv({ allErrors: true, schemas: [] })

describe('access token request body', () => {
  it('requires client_id, code, code_verifier, grant_type=authorization_code, redirect_uri', (t) => {
    const validate = ajv.compile(access_token_request_body)

    const client_id = canonicalUrl('micropub-client.com')
    const redirect_uri = canonicalUrl(`${client_id}auth/callback`)
    const code = nanoid(32)
    const code_verifier = codeVerifier({ len: 43 })
    const grant_type = 'authorization_code'

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
