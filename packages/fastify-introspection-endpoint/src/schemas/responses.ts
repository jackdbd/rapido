import {
  client_id,
  exp,
  iat,
  iss,
  jti,
  me_after_url_canonicalization,
  scope
} from '@jackdbd/indieauth/schemas'
import { Static, Type } from '@sinclair/typebox'

export const active = Type.Boolean({
  description: `Boolean indicator of whether or not the presented token is currently active.`,
  title: 'active'
})

/**
 * Introspection Response.
 *
 * OAuth 2.0 Token Introspection requires only `active` in the introspection
 * response. IndieAuth requires also `me`. It's not clear whether IndieAuth also
 * requires `client_id` and `scope`.
 *
 * An access token with no scope should be invalid, but I am not sure I should
 * treat as invalid a refresh token that has no associated scope.
 *
 * The presence of `client_id` and `scope` allows a stricter token validation,
 * so I think it makes sense to err on the side of caution and require both.
 *
 * @see [Access Token Verification Response - IndieAuth ](https://indieauth.spec.indieweb.org/#access-token-verification-response)
 * @see [OAuth 2.0 Token Introspection (RFC 7662)](https://www.rfc-editor.org/rfc/rfc7662#section-2.2)
 */
export const introspection_response_body_when_token_is_retrieved = Type.Object(
  {
    active,
    client_id,
    exp: Type.Optional(exp),
    iat: Type.Optional(iat),
    iss: Type.Optional(iss),
    jti: Type.Optional(jti),
    me: me_after_url_canonicalization,
    scope
  },
  {
    $id: 'introspection-response-body-when-token-is-retrieved',
    description:
      'The JSON response body that the server sends to a client upon receiving a valid POST request and retrieving the given token sent with the request body.',
    title: 'introspect POST response (token retrieved)'
  }
)

export type IntrospectionResponseBodyWhenTokenIsRetrieved = Static<
  typeof introspection_response_body_when_token_is_retrieved
>

export const introspection_response_body_when_token_is_not_retrieved =
  Type.Object(
    {
      active: Type.Literal(false)
    },
    {
      $id: 'introspection-response-body-when-token-is-not-retrieved',
      description:
        'The JSON response body that the server sends to a client upon receiving a valid POST request and NOT retrieving the given token sent with the request body.',
      title: 'introspect POST response (token not retrieved)'
    }
  )

export type IntrospectionResponseBodyWhenTokenIsNotRetrieved = Static<
  typeof introspection_response_body_when_token_is_not_retrieved
>
