import assert from 'node:assert'
import { safeDecode } from '../lib/index.js'

export const assertTokenHasExpectedClaims = async ({ jwt, claims }) => {
  const { error, value: actual_claims } = await safeDecode(jwt)

  assert.ok(!error)

  claims.forEach((claim) => {
    assert.ok(actual_claims[claim])
  })
}
