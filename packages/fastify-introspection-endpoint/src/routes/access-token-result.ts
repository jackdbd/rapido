import { isExpired, safeDecode, verify } from '@jackdbd/indieauth'
import type { AccessTokenClaims, JWKSPublicURL } from '@jackdbd/indieauth'
import type {
  AccessTokenImmutableRecord,
  AccessTokenMutableRecord,
  RetrieveAccessToken,
  IsAccessTokenRevoked
} from '@jackdbd/indieauth/schemas'

interface Config {
  isAccessTokenRevoked: IsAccessTokenRevoked
  retrieveAccessToken: RetrieveAccessToken
  issuer: string
  jwks_url: JWKSPublicURL
  jwt: string
}

export const accessTokenResult = async (config: Config) => {
  const { isAccessTokenRevoked, issuer, jwks_url, jwt, retrieveAccessToken } =
    config

  // const header = jose.decodeProtectedHeader(token)
  // request.log.debug(header, `JWT protected header`)

  // SECURITY CONSIDERATIONS
  // https://www.rfc-editor.org/rfc/rfc7662#section-4

  // RFC 7662 says that if the token has been signed, the authorization server
  // MUST validate the signature. This means that just decoding the token is
  // not enough. We need to verify it.
  const { value: verified_claims } = await verify<AccessTokenClaims>({
    issuer,
    jwks_url,
    jwt
  })

  const { error: decode_error, value: decoded_claims } =
    await safeDecode<AccessTokenClaims>(jwt)

  let claims: AccessTokenClaims
  if (verified_claims) {
    claims = verified_claims
  } else {
    if (decoded_claims) {
      claims = decoded_claims
    } else {
      // Having a verify_error is fine. E.g. if the token in the request body
      // is expired, we get a verify_error but NOT a decode_error.
      return { error: new Error(decode_error.message) }
    }
  }

  const { exp, jti } = claims

  let record: AccessTokenImmutableRecord | AccessTokenMutableRecord | undefined

  try {
    record = await retrieveAccessToken(jti)
  } catch (ex: any) {
    let message = `Cannot determine whether access token jti=${jti} is revoked or not.`
    if (ex && ex.message) {
      message = `${message} Here is the original error message: ${ex.message}`
    }
    return { error: new Error(message) }
  }

  if (record) {
    // RFC 7662 says that if the token can expire, the authorization server MUST
    // determine whether or not the token has expired.
    let expired = false
    if (exp) {
      expired = isExpired(exp)
    }

    // RFC 7662 says that if the token can be revoked after it was issued, the
    // authorization server MUST determine whether or not such a revocation has
    // taken place.
    let revoked = false
    if (jti) {
      try {
        revoked = await isAccessTokenRevoked(jti)
      } catch (ex: any) {
        const message = `Cannot determine whether access token jti=${jti} is revoked or not: ${ex.message}`
        return { error: new Error(message) }
      }
    }

    const active = !expired && !revoked ? true : false
    const { client_id } = record

    // A token introspection response MUST include these parameters: active,
    // client_id, me, scope.
    // These other parameters are OPTIONAL: exp, iat, iss, jti.
    let message: string | undefined

    if (!client_id) {
      message =
        'The access token record is missing the parameter `client_id` (information about the client this access token was issued for).'
    }

    if (!claims.me) {
      message = 'The access token is missing the `me` claim.'
    }

    if (!claims.scope) {
      message = 'The access token is missing the `scope` claim.'
    }

    if (message) {
      // I am not sure this is the most appropriate error to return in this
      // case. But it seems the most reasonable to me.
      return {
        error: new Error(message)
      }
    }

    return { value: { found: { ...claims, active, client_id } } }
  } else {
    return { value: { found: undefined } }
  }
}
