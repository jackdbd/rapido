import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { defAjv } from '@repo/stdlib/test-utils'
import { nanoid } from 'nanoid'
import { refresh_request_body } from '../lib/schemas/requests.js'

const ajv = defAjv({
  allErrors: true,
  schemas: []
})

describe('refresh request body', () => {
  it('must include: client_id, grant_type=refresh_token, refresh_token', (t) => {
    const validate = ajv.compile(refresh_request_body)

    const client_id = canonicalUrl('micropub-client.com')
    const grant_type = 'refresh_token'
    const refresh_token = nanoid()

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, grant_type })
    t.assert.ok(validate.errors.length >= 1)

    validate({ client_id, grant_type, refresh_token })
    t.assert.equal(validate.errors, null)
  })
})
