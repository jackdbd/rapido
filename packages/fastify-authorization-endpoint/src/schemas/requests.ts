import {
  client_id,
  me_after_url_canonicalization,
  me_before_url_canonicalization
} from '@jackdbd/indieauth/schemas'
import { authorization_code, redirect_uri, scope, state } from '@jackdbd/oauth2'
import {
  code_challenge,
  code_challenge_method,
  code_verifier
} from '@jackdbd/pkce'
import { Static, Type } from '@sinclair/typebox'

export const response_type = Type.Union(
  [Type.Literal('code'), Type.Literal('token')],
  {
    title: 'OAuth 2.0 response_type',
    description: 'Tells the authorization server which grant to execute.',
    default: 'code'
  }
)

/**
 * Query string of the Authorization Request.
 *
 * @see [Authorization Request - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1)
 * @see [Authorization Request - IndieAuth](https://indieauth.spec.indieweb.org/#authorization-request)
 */
export const authorization_request_querystring = Type.Object(
  {
    client_id,

    code_challenge: Type.Ref(code_challenge.$id!),
    // code_challenge,

    code_challenge_method: Type.Ref(code_challenge_method.$id!),

    /**
     * Profile URL.
     *
     * The IndieAuth client SHOULD provide the "me" query string parameter to the
     * authorization endpoint, either the exact value the user entered, or the
     * value after applying [URL Canonicalization](https://indieauth.spec.indieweb.org/#url-canonicalization).
     *
     * Either the string that the user entered, or the value after applying [URL
     * Canonicalization](https://indieauth.spec.indieweb.org/#url-canonicalization).
     */
    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization
    ]),

    /**
     * The URL to which this authorization endpoint redirects the client after the
     * end user **approves** the authorization request.
     */
    redirect_uri,

    /**
     * The value MUST be one of "code" for requesting an authorization code.
     */
    response_type,

    scope: Type.Optional(scope),

    state
  },
  {
    title: 'Authorization Request Querystring',
    $id: 'authorization-endpoint-authorization-request-querystring'
  }
)

export type AuthorizationRequestQuerystring = Static<
  typeof authorization_request_querystring
>

/**
 * Access Token Request body.
 *
 * Once the client has obtained an authorization code, it can redeem it for an
 * access token.
 *
 * @see [Redeeming the Authorization Code - IndieAuth](https://indieauth.spec.indieweb.org/#redeeming-the-authorization-code)
 * @see [Access Token Request - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3)
 */
export const access_token_request_body = Type.Object(
  {
    client_id,
    code: authorization_code,
    code_verifier,
    grant_type: Type.Literal('authorization_code'),
    redirect_uri
  },
  {
    title: 'Access Token Request Body',
    $id: 'authorization-endpoint-access-token-request-body'
  }
)

export type AccessTokenRequestBody = Static<typeof access_token_request_body>

export const profile_url_request_body = Type.Object({
  client_id,
  code: authorization_code,
  code_verifier,
  grant_type: Type.Optional(Type.Literal('profile_url')),
  redirect_uri
})

export type ProfileUrlRequestBody = Static<typeof profile_url_request_body>

/**
 * Action that the resource owner can take in regards to an authorization
 * request.
 *
 * For example, the authorization endpoint may render a consent form containing
 * an "APPROVE" button and a "DENY" button, and the end user may click either
 * one of those buttons.
 */
const action = Type.Union([Type.Literal('approve'), Type.Literal('deny')])

export type Action = Static<typeof action>

export const handle_action_querystring = Type.Object({
  action,

  client_id,

  code_challenge,

  code_challenge_method,

  me: Type.Union([
    me_before_url_canonicalization,
    me_after_url_canonicalization
  ]),

  /**
   * The URL where the authorization server redirects the client after the user
   * **approves** the authorization request.
   */
  redirect_uri,

  /**
   * The URL where the authorization server redirects the client after the user
   * **denies** the authorization request.
   */
  redirect_uri_on_deny: redirect_uri,

  scope,

  state
})

export type HandleActionQuerystring = Static<typeof handle_action_querystring>
