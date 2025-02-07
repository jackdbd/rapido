import { describe, it } from 'node:test'
import assert from 'node:assert'
import { nanoid } from 'nanoid'
import { randomKid, safeDecode, sign } from '../lib/index.js'
import {
  ACCESS_TOKEN_EXPIRATION,
  ISSUER,
  jwks
} from '../../stdlib/lib/test-utils.js'

describe('safeDecode', () => {
  it('does not throw when trying to decode an invalid JWT', () => {
    assert.doesNotThrow(async () => {
      await safeDecode('foo')
    })
  })

  it('returns an error when trying to decode an invalid JWT', async () => {
    const { error, value } = await safeDecode('foo')

    assert.ok(error)
    assert.ok(!value)
  })

  it('returns the expected claims, if the JWT was signed with a valid secret', async () => {
    const expiration = ACCESS_TOKEN_EXPIRATION
    const issuer = ISSUER
    const payload = { abc: nanoid(), xyz: nanoid() }

    const { error: kid_error, value: kid } = randomKid(jwks.keys)
    assert.ok(!kid_error)
    assert.ok(kid)

    const { error: sign_error, value: jwt } = await sign({
      expiration,
      issuer,
      jwks,
      kid,
      payload
    })

    assert.ok(!sign_error)
    assert.ok(jwt)

    const { error: decode_error, value: claims } = await safeDecode(jwt)
    assert.ok(!decode_error)
    assert.ok(claims)

    assert.strictEqual(claims.iss, issuer)
    assert.ok(claims.exp !== undefined)
    assert.ok(claims.iat !== undefined)
    assert.ok(claims.jti !== undefined)

    Object.entries(payload).forEach(([key, value]) => {
      assert.strictEqual(claims[key], value)
    })
  })
})
