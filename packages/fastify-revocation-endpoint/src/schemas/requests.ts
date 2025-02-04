import { access_token, refresh_token } from '@jackdbd/oauth2'
import { Static, Type } from '@sinclair/typebox'
import { token_type_hint } from './common.js'
import { revocation_reason } from './revocation.js'

/**
 * Revocation request.
 *
 * @see [Revocation Request - OAuth 2.0 Token Revocation (RFC 7009)](https://www.rfc-editor.org/rfc/rfc7009#section-2.1)
 */
export const revocation_request_body = Type.Object(
  {
    revocation_reason: Type.Optional(revocation_reason),
    /**
     * The token to revoke. It may be an access token or a refresh token. It may
     * different from the access token used to authorize the request.
     */
    token: Type.Union([access_token, refresh_token]),
    token_type_hint: Type.Optional(token_type_hint)
  },
  {
    $id: 'revocation-request-body',
    additionalProperties: false,
    description: 'The body sent by the client with a POST request.',
    title: 'Revocation POST request'
  }
)

export type RevocationRequestBody = Static<typeof revocation_request_body>
