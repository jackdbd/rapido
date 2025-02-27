import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ISSUER, jwks } from '@repo/stdlib/test-utils'
import { randomKid, sign } from '../lib/index.js'

describe('sign', () => {
  it('can issue a JWT', async () => {
    const { error: kid_error, value: kid } = randomKid(jwks.keys)
    assert.ok(!kid_error)

    const { error, value: jwt } = await sign({
      expiration: '1 hour',
      issuer: ISSUER,
      jwks,
      kid,
      payload: { foo: 'bar' }
    })

    assert.ok(!error)
    assert.ok(jwt)
  })
})
