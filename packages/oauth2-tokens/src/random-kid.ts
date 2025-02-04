import * as jose from 'jose'

/**
 * Picks a random key ID (kid) from a list of JSON Web Key (JWK).
 */
export const randomKid = (keys: jose.JWK[]) => {
  const i = Math.floor(Math.random() * keys.length)

  const jwk = keys[i]
  if (!jwk) {
    return {
      error: new Error(
        `JWKS has no JWK at index ${i} (JWKS has size ${keys.length})`
      )
    }
  }

  const kid = jwk.kid
  if (!kid) {
    return {
      error: new Error(
        `JWK index ${i} (JWKS has size ${keys.length}) has no 'kid' (key ID) parameter`
      )
    }
  } else {
    return { value: kid }
  }
}
