import { describe, it } from 'node:test'
import canonicalUrl from '@jackdbd/canonical-url'
import { defAjv } from '@repo/stdlib/test-utils'
import { profile_url_response_body_success } from '../lib/schemas/responses.js'

const ajv = defAjv({ allErrors: true, schemas: [] })

describe('profile URL response body success', () => {
  it('must include: me', (t) => {
    const validate = ajv.compile(profile_url_response_body_success)

    const me = canonicalUrl('end-user.com')

    validate({})
    t.assert.ok(validate.errors.length >= 1)

    validate({ me })
    t.assert.equal(validate.errors, null)
  })
})
