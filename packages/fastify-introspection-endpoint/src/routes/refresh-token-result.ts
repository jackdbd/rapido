import { isExpired } from '@jackdbd/indieauth'
import type {
  RefreshTokenImmutableRecord,
  RefreshTokenMutableRecord,
  RetrieveRefreshToken,
  IsRefreshTokenRevoked
} from '@jackdbd/indieauth/schemas'

interface Config {
  isRefreshTokenRevoked: IsRefreshTokenRevoked
  retrieveRefreshToken: RetrieveRefreshToken
  token: string
}

export const refreshTokenResult = async (config: Config) => {
  const { isRefreshTokenRevoked, retrieveRefreshToken, token } = config

  let record:
    | RefreshTokenImmutableRecord
    | RefreshTokenMutableRecord
    | undefined

  // let found: IntrospectionResponseBodySuccess | undefined

  try {
    record = await retrieveRefreshToken(token)
  } catch (ex: any) {
    let message = `Cannot determine whether refresh token ${token} is revoked or not.`
    if (ex && ex.message) {
      message = `${message} Here is the original error message: ${ex.message}`
    }
    return { error: new Error(message) }
  }

  if (record) {
    let message: string | undefined

    if (!record.client_id) {
      message =
        'The refresh token record is missing the parameter `client_id` (information about the client this refresh token was issued for).'
    }

    if (!record.exp) {
      message =
        'The refresh token record is missing the parameter `exp` (information on token expiration). Cannot determine the `active` parameter.'
    }

    if (!record.redirect_uri) {
      message =
        'The refresh token record is missing the parameter `redirect_uri` (information about the redirect URL of the client this refresh token was issued for).'
    }

    if (!record.scope) {
      message =
        'The refresh token record is missing the parameter `scope`. Without this information, the authorization server cannot determine which scopes to grant to the access token when making a refresh request.'
    }

    if (message) {
      // I am not sure this is the most appropriate error to return in this
      // case. But it seems the most reasonable to me.
      return { error: new Error(message) }
    }

    // RFC 7662 says that if the token can expire, the authorization server MUST
    // determine whether or not the token has expired.
    const expired = isExpired(record.exp)

    // RFC 7662 says that if the token can be revoked after it was issued, the
    // authorization server MUST determine whether or not such a revocation has
    // taken place.
    let revoked = false

    try {
      revoked = await isRefreshTokenRevoked(token)
    } catch (ex: any) {
      let message = `Cannot determine whether refresh token ${token} is revoked or not.`
      if (ex && ex.message) {
        message = `${message} Here is the original error message: ${ex.message}`
      }
      return { error: new Error(message) }
    }

    const active = !expired && !revoked ? true : false
    const { client_id, exp, iss, jti, me, scope } = record

    return { value: { found: { active, client_id, exp, iss, jti, me, scope } } }
  } else {
    return { value: { found: undefined } }
  }
}
