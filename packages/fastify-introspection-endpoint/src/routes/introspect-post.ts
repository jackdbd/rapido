import type { RouteGenericInterface, RouteHandler } from 'fastify'
import {
  InvalidRequestError,
  InvalidTokenError,
  ServerError
} from '@jackdbd/oauth2-error-responses'
import { safeDecode, verify } from '@jackdbd/oauth2-tokens'
import type { AccessTokenClaims } from '@jackdbd/oauth2-tokens'
import { conformResult, throwWhenNotConform } from '@jackdbd/schema-validators'
import { isExpired } from '../predicates.js'
import {
  introspect_post_config,
  introspection_response_body_success
} from '../schemas/index.js'
import type {
  AccessTokenImmutableRecord,
  AccessTokenMutableRecord,
  IntrospectionRequestBody,
  IntrospectPostConfig
} from '../schemas/index.js'

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
    issuer,
    jwks_url,
    logPrefix: log_prefix,
    // max_access_token_age: max_token_age,
    retrieveAccessToken
    // retrieveRefreshToken,
  } = config

  const introspectPost: RouteHandler<RouteGeneric> = async (request, reply) => {
    if (!request.body) {
      const error_description = 'Request has no body.'
      const err = new InvalidRequestError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    const { token: jwt, token_type_hint } = request.body

    // TODO: allow to introspect refresh tokens?
    if (token_type_hint === 'refresh_token') {
      const error_description = `Introspecting refresh tokens is not supported by this introspection endpoint.`
      const err = new InvalidRequestError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    if (!jwt) {
      const error_description = 'The `token` parameter is missing.'
      const err = new InvalidTokenError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    // const header = jose.decodeProtectedHeader(jwt)
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
      // max_token_age
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
        const error_description = decode_error.message
        const err = new InvalidTokenError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    }

    const { exp, jti } = claims

    let record:
      | AccessTokenImmutableRecord
      | AccessTokenMutableRecord
      | undefined
    try {
      record = await retrieveAccessToken(jti)
    } catch (ex: any) {
      const error_description = `The provided retrieveAccessToken threw an exception: ${ex.message}`
      const err = new ServerError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    if (!record) {
      const error_description = `The provided retrieveAccessToken could not find an access token that has jti=${jti}`
      const err = new ServerError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

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
      request.log.debug(
        `${log_prefix}check whether access token jti=${jti} is revoked`
      )
      try {
        revoked = await isAccessTokenRevoked(jti)
      } catch (ex: any) {
        const error_description = `Cannot determine whether access token jti=${jti} is revoked or not: ${ex.message}`
        const err = new ServerError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    }

    const active = !expired && !revoked ? true : false
    const client_id = record.client_id

    const response_body = { ...claims, active, client_id }

    const { error: conform_error } = conformResult(
      {
        ajv,
        schema: introspection_response_body_success,
        data: response_body
      },
      {
        basePath: 'introspection-endpoint-response-body-success',
        validationErrorsSeparator: ';'
      }
    )

    if (conform_error) {
      const preface = `The response the server was about to send to the client does not conform to the expected schema. This is probably a bug. Here are the details of the error:`
      const error_description = `${preface} ${conform_error.message}`
      const err = new ServerError({ error_description })
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }))
    }

    return reply.code(200).send(response_body)
  }

  return introspectPost
}
