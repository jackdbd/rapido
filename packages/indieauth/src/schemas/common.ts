import { Static, Type } from '@sinclair/typebox'

export const ajv = Type.Any({ description: 'Instance of Ajv' })

export const expiration = Type.String({
  description: `Human-readable expiration time for the token issued by the token endpoint.`,
  minLength: 1,
  title: 'Token expiration',
  examples: ['60 seconds', '5 minutes', '1 hour', '30 days']
})

export const expires_in = Type.Number({ minimum: 1 })

/**
 * Redirection Endpoint.
 *
 * @see [Redirection Endpoint](https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2)
 * @see [Redirect URL](https://indieauth.spec.indieweb.org/#redirect-url)
 */
export const redirect_uri = Type.String({
  description:
    'Holds a URL. A successful response from this endpoint results in a redirect to this URL.',
  format: 'uri'
})

/**
 * Parameter that tells the Authorization Server which mechanism to use for
 * returning Authorization Response parameters from the Authorization Endpoint.
 *
 * @see [Response Modes - OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#ResponseModes)
 */
export const response_mode = Type.Union(
  [Type.Literal('fragment'), Type.Literal('query')],
  {
    $id: 'oauth-2.0-response-mode',
    description: `OAuth 2.0 response_mode. See [Response Modes - OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#ResponseModes).`
  }
)

export type ResponseMode = Static<typeof response_mode>

/**
 * OAuth 2.0 response_type string that a client can use at the authorization
 * endpoint.
 *
 * - `code`: The authorization code response type defined in [OAuth 2.0, Section 4.1](https://datatracker.ietf.org/doc/html/rfc7591#section-4.1).
 * - `token`: The implicit response type defined in [OAuth 2.0, Section 4.2](https://datatracker.ietf.org/doc/html/rfc7591#section-4.2).
 *
 * @see [Relationship between Grant Types and Response Types - OAuth 2.0 Dynamic Client Registration Protocol (RFC7591)](https://datatracker.ietf.org/doc/html/rfc7591#section-2.1)
 */
export const response_type = Type.Union(
  [Type.Literal('code'), Type.Literal('token')],
  {
    $id: 'oauth-2.0-response-type',
    description: 'Tells the authorization server which grant to execute.'
  }
)

export type ResponseType = Static<typeof response_type>

export const scope = Type.String({
  description: `Scope values. See [RFC8693 scope claim](https://www.rfc-editor.org/rfc/rfc8693.html#name-scope-scopes-claim)`,
  minLength: 1,
  title: 'OAuth 2.0 scope (scopes) claim'
})

/**
 * An opaque value used by the client to maintain state between the request and
 * callback. The parameter SHOULD be used for preventing cross-site request
 * forgery.
 *
 * @see [Prevent Attacks and Redirect Users with OAuth 2.0 State Parameters](https://auth0.com/docs/secure/attack-protection/state-parameters)
 */
export const state = Type.String({
  description:
    'An opaque value used by the client to maintain state between the request and callback. The parameter SHOULD be used for preventing cross-site request forgery. See [OAuth 2.0 Authorization Request](https://www.rfc-editor.org/rfc/rfc6749#section-4.1.1).',
  minLength: 1,
  title: 'OAuth 2.0 state parameter (CSRF token)'
})
