import {
  client_id,
  me_after_url_canonicalization
} from '@jackdbd/indieauth/schemas'
import { scope } from '@jackdbd/oauth2'
import { exp, iat, iss, jti } from '@jackdbd/oauth2-tokens'
import { Static, Type } from '@sinclair/typebox'

export const active = Type.Boolean({
  description: `Boolean indicator of whether or not the presented token is currently active.`,
  title: 'active'
})

/**
 * Introspection Response.
 *
 * @see [Access Token Verification Response - IndieAuth ](https://indieauth.spec.indieweb.org/#access-token-verification-response)
 * @see [OAuth 2.0 Token Introspection (RFC 7662)](https://www.rfc-editor.org/rfc/rfc7662#section-2.2)
 */
export const introspection_response_body_success = Type.Object(
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
    $id: 'introspection-response-body-success',
    additionalProperties: false,
    description:
      'The JSON response body that the server sends to a client upon receiving a valid POST request.',
    title: 'introspect POST response'
  }
)

export type IntrospectionResponseBodySuccess = Static<
  typeof introspection_response_body_success
>
