import type { RouteGenericInterface, RouteHandler } from 'fastify'
import { InvalidRequestError } from '@jackdbd/oauth2-error-responses'
import { throwWhenNotConform } from '@jackdbd/schema-validators'
import { introspect_post_config } from '../schemas/index.js'
import type {
  IntrospectionRequestBody,
  IntrospectionResponseBodyWhenTokenIsRetrieved,
  IntrospectPostConfig
} from '../schemas/index.js'
import { accessTokenResult } from './access-token-result.js'
import { refreshTokenResult } from './refresh-token-result.js'

interface RouteGeneric extends RouteGenericInterface {
  Body: IntrospectionRequestBody
}

/**
 * Introspects a token.
 *
 * This endpoint returns this information about the token:
 *
 * - `active`: Boolean indicator of whether or not the presented token is
 *   currently active
 * - `me`: The profile URL of the user corresponding to this token
 * - `client_id`: The client ID associated with this token
 * - `scope`: A space-separated list of scopes associated with this token
 * - `exp`: Integer timestamp, measured in the number of seconds since January 1
 *   1970 UTC, indicating when this token will expire
 * - `iat`: Integer timestamp, measured in the number of seconds since January 1
 *   1970 UTC, indicating when this token was originally issued
 *
 * @see [OAuth 2.0 Token Introspection (RFC 7662)](https://www.rfc-editor.org/rfc/rfc7662)
 * @see [Access Token Verification Response - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-verification-response)
 */
export const defIntrospectPost = (config: IntrospectPostConfig) => {
  const ajv = config.ajv

  throwWhenNotConform(
    { ajv, schema: introspect_post_config, data: config },
    { basePath: 'introspection-endpoint post method config ' }
  )

  const {
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    isRefreshTokenRevoked,
    issuer,
    jwks_url,
    logPrefix: log_prefix,
    // max_access_token_age: max_token_age,
    retrieveAccessToken,
    retrieveRefreshToken
  } = config

  const introspectPost: RouteHandler<RouteGeneric> = async (request, reply) => {
    if (!request.body) {
      const error_description = 'Request has no body.'
      const err = new InvalidRequestError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    const { token } = request.body

    if (!token) {
      const error_description = 'The `token` parameter is missing.'
      request.log.warn(`${log_prefix}${error_description}`)
      const err = new InvalidRequestError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    // If the user does not provide a token_type_hint, this endpoint assumes
    // it's an access token. We could also use an heuristic to guess whether we
    // received an access token or a refresh token (e.g. a string longer than
    // 35-40 characters is most likely an access token).
    const token_type_hint = request.body.token_type_hint || 'access_token'

    // Regardless of token_type_hint, we might end up searching all token types.
    // This is what the Token Introspection says:
    // If the server is unable to locate the token using the given hint, it MUST
    // extend its search across all of its supported token types.
    // https://www.rfc-editor.org/rfc/rfc7662#section-2.1

    let response_body: IntrospectionResponseBodyWhenTokenIsRetrieved | undefined
    if (token_type_hint === 'access_token') {
      request.log.debug(`${log_prefix}search among access tokens`)
      const res_one = await accessTokenResult({
        issuer,
        jwks_url,
        jwt: token,
        retrieveAccessToken,
        isAccessTokenRevoked
      })

      if (res_one.error) {
        request.log.error(`${log_prefix}${res_one.error.message}`)
      }

      if (res_one.value && res_one.value.found) {
        response_body = res_one.value.found
      }

      if (!response_body) {
        request.log.debug(
          `${log_prefix}search among refresh tokens because token was not found among access tokens`
        )
        const res_two = await refreshTokenResult({
          retrieveRefreshToken,
          isRefreshTokenRevoked,
          token
        })

        if (res_two.error) {
          request.log.error(`${log_prefix}${res_two.error.message}`)
        }

        if (res_two.value && res_two.value.found) {
          response_body = res_two.value.found
        }
      }
    } else if (token_type_hint === 'refresh_token') {
      request.log.debug(`${log_prefix}search among refresh tokens`)
      const res_one = await refreshTokenResult({
        retrieveRefreshToken,
        isRefreshTokenRevoked,
        token
      })

      if (res_one.error) {
        request.log.error(`${log_prefix}${res_one.error.message}`)
      }

      if (res_one.value && res_one.value.found) {
        response_body = res_one.value.found
      }

      if (!response_body) {
        request.log.debug(
          `${log_prefix}search among access tokens because token was not found among refresh tokens`
        )
        const res_two = await accessTokenResult({
          issuer,
          jwks_url,
          jwt: token,
          retrieveAccessToken,
          isAccessTokenRevoked
        })

        if (res_two.error) {
          request.log.error(`${log_prefix}${res_two.error.message}`)
        }

        if (res_two.value && res_two.value.found) {
          response_body = res_two.value.found
        }
      }
    } else {
      const error_description = `This endpoint does not support requests that have token_type_hint=${token_type_hint}.`
      request.log.warn(`${log_prefix}${error_description}`)
      const err = new InvalidRequestError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    // NOTE: no error response /////////////////////////////////////////////////
    // A properly formed and authorized query for an inactive or otherwise
    // invalid token (or a token the protected resource is not allowed to know
    // about) is not considered an error response by this specification.
    // In these cases, the authorization server MUST instead respond with an
    // introspection response with the "active" field set to "false" as
    // described in Section 2.2.
    // https://www.rfc-editor.org/rfc/rfc7662#section-2.3
    if (response_body) {
      return reply.code(200).send(response_body)
    } else {
      return reply.code(200).send({ active: false })
    }
  }

  return introspectPost
}
