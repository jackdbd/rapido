import { describe, it } from 'node:test'
import assert from 'node:assert'
import { verify } from '../lib/index.js'
import {
  ACCESS_TOKEN_EXPIRATION,
  ISSUER,
  jwks_url
} from '../../stdlib/lib/test-utils.js'

describe('verify', () => {
  it('does not throw when trying to verify an invalid JWT', async () => {
    const expiration = ACCESS_TOKEN_EXPIRATION
    const issuer = ISSUER

    assert.doesNotThrow(async () => {
      await verify({
        issuer,
        jwks_url,
        jwt: 'foo',
        max_token_age: expiration
      })
    })
  })
})
