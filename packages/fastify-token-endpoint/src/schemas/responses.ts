import { me_after_url_canonicalization, profile } from '@jackdbd/indieauth'
import { access_token, expires_in, refresh_token, scope } from '@jackdbd/oauth2'
import { Static, Type } from '@sinclair/typebox'

export const access_token_response_body_success = Type.Object({
  access_token,

  expires_in: Type.Optional(
    Type.Number({
      ...expires_in,
      description: 'The lifetime in seconds of the access token.'
    })
  ),

  me: Type.String({
    ...me_after_url_canonicalization,
    description:
      'The canonical user profile URL for the user this access token corresponds to.'
  }),

  profile: Type.Optional(profile),

  refresh_token: Type.Optional(refresh_token),

  scope,

  token_type: Type.Literal('Bearer')
})

/**
 * Response body to a successful Access Token Request.
 *
 * @see [Access Token Response - IndieAuth](https://indieauth.spec.indieweb.org/#access-token-response)
 * @see [Access Token Response - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4)
 */
export type AccessTokenResponseBodySuccess = Static<
  typeof access_token_response_body_success
>

// === COPIED FROM fastify-authorization-endpoint =========================== //
/**
 * Response body to a successful Authorization Request.
 *
 * If the user approves the request, the authorization endpoint generates an
 * authorization code and builds the redirect back to the client.
 *
 * @see [Authorization Response - IndieAuth](https://indieauth.spec.indieweb.org/#authorization-response)
 * @see [Authorization Response - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2)
 */
export const authorization_response_body_success = Type.Object({
  me: me_after_url_canonicalization,
  scope: Type.Optional(scope)
})

export type AuthorizationResponseBodySuccess = Static<
  typeof authorization_response_body_success
>
// ========================================================================== //
