import { Static, Type } from '@sinclair/typebox'
import { response_mode, response_type, scope } from './common.js'
import {
  authorization_endpoint,
  introspection_endpoint,
  registration_endpoint,
  revocation_endpoint,
  token_endpoint,
  userinfo_endpoint
} from './endpoints.js'
import { grant_type } from './grant-type.js'

/**
 * Issuer identifier of the authorization server.
 *
 * The issuer identifier is a URL that uses the "https" scheme and has no
 * query or fragment components as defined in RFC9207. It MUST also be a
 * prefix of the indieauth-metadata URL.
 *
 * @see [Issuer Identifier](https://indieauth.spec.indieweb.org/#issuer-identifier)
 * @see [OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207)
 */
export const issuer = Type.String({
  description: `The authorization server's issuer identifier. It's a URL that uses the "https" scheme and has no query or fragment components. It MUST also be a prefix of the indieauth-metadata URL.`,
  format: 'uri',
  title: 'Issuer'
})

export const jwks_uri = Type.String({
  description: `URL of the authorization server's JWK Set document.`,
  format: 'uri',
  title: 'JWKS URI'
})

export const scopes_supported = Type.Array(scope, {
  description: `JSON array containing a list of the OAuth 2.0 "scope" values that this authorization server supports.`,
  title: 'Scopes'
})

const response_types_supported = Type.Array(response_type, {
  description: `JSON array containing a list of the OAuth 2.0 "response_type" values that this authorization server supports. The array values used are the same as those used with the "response_types" parameter defined by "OAuth 2.0 Dynamic Client Registration Protocol".`
})

const response_modes_supported = Type.Array(response_mode, {
  description: `JSON array containing a list of the OAuth 2.0 "response_mode" values that this authorization server supports, as specified in "OAuth 2.0 Multiple Response Type Encoding Practices".`,
  default: ['query', 'fragment']
})

export const grant_types_supported = Type.Array(grant_type, {
  description: `JSON array containing a list of the OAuth 2.0 grant type values that this authorization server supports.`,
  default: ['authorization_code', 'implicit']
})

const token_endpoint_auth_method = Type.String({
  description: `client authentication method`
})

const token_endpoint_auth_methods_supported = Type.Array(
  token_endpoint_auth_method,
  {
    description: `JSON array containing a list of client authentication methods supported by this token endpoint.`,
    default: ['client_secret_basic']
  }
)

const token_endpoint_auth_signing_alg = Type.String({
  description: `JWS signing algorithm supported by the token endpoint`
})

const token_endpoint_auth_signing_alg_values_supported = Type.Array(
  token_endpoint_auth_signing_alg,
  {
    description: `JSON array containing a list of the JWS signing algorithms ("alg" values) supported by the token endpoint for the signature on the JWT [JWT] used to authenticate the client at the token endpoint for the "private_key_jwt" and "client_secret_jwt" authentication methods. No default algorithms are implied if this entry is omitted. Servers SHOULD support "RS256".  The value "none" MUST NOT be used.`
  }
)

const service_documentation = Type.String({
  description: `URL of a page containing human-readable information that developers might want or need to know when using the authorization server.`,
  format: 'uri'
})

const ui_locales_supported = Type.Array(Type.String(), {
  description: `Languages and scripts supported for the user interface, represented as a JSON array of language tag values from BCP 47 [RFC5646].`
})

const op_policy_uri = Type.String({
  description: `URL that the authorization server provides to the person registering the client to read about the authorization server's requirements on how the client can use the data provided by the authorization server.`,
  format: 'uri'
})

const op_tos_uri = Type.String({
  description: `URL that the authorization server provides to the person registering the client to read about the authorization server's terms of service.`,
  format: 'uri'
})

const revocation_endpoint_auth_methods_supported = Type.Array(Type.String(), {
  description: `JSON array containing a list of client authentication methods supported by this revocation endpoint.`,
  default: ['client_secret_basic']
})

const revocation_endpoint_auth_signing_alg_values_supported = Type.Array(
  Type.String(),
  {
    description: `JSON array containing a list of the JWS signing algorithms ("alg" values) supported by the revocation endpoint for the signature on the JWT used to authenticate the client at the revocation endpoint for the "private_key_jwt" and "client_secret_jwt" authentication methods`
  }
)

const introspection_endpoint_auth_methods_supported = Type.Array(
  Type.String(),
  {
    description: `JSON array containing a list of client authentication methods supported by this introspection endpoint.`
  }
)

const introspection_endpoint_auth_signing_alg_values_supported = Type.Array(
  Type.String(),
  {
    description: `JSON array containing a list of the JWS signing algorithms ("alg" values) supported by the introspection endpoint for the signature on the JWT used to authenticate the client at the introspection endpoint for the "private_key_jwt" and "client_secret_jwt" authentication methods.`
  }
)

const code_challenge_methods_supported = Type.Array(Type.String(), {
  description: `JSON array containing a list of Proof Key for Code Exchange (PKCE) code challenge methods supported by this authorization server.`
})

// This is defined by IndieAuth, nt by OAuth 2.0
// https://indieauth.spec.indieweb.org/#indieauth-server-metadata
const authorization_response_iss_parameter_supported = Type.Boolean({
  description: `Boolean parameter indicating whether the authorization server provides the iss parameter.`,
  default: false
})

/**
 * [IndieAuth Server Metadata](https://indieauth.spec.indieweb.org/#indieauth-server-metadata)
 */
export const server_metadata = Type.Object({
  authorization_endpoint,

  /**
   * Boolean parameter indicating whether the authorization server provides the
   * `iss` parameter.
   */
  authorization_response_iss_parameter_supported: Type.Optional(
    authorization_response_iss_parameter_supported
  ),

  /**
   * JSON array containing a list of Proof Key for Code Exchange (PKCE) code
   * challenge methods supported by this authorization server.
   */
  code_challenge_methods_supported: Type.Optional(
    code_challenge_methods_supported
  ),

  grant_types_supported: Type.Optional(grant_types_supported),

  introspection_endpoint: Type.Optional(introspection_endpoint),

  introspection_endpoint_auth_methods_supported: Type.Optional(
    introspection_endpoint_auth_methods_supported
  ),

  introspection_endpoint_auth_signing_alg_values_supported: Type.Optional(
    introspection_endpoint_auth_signing_alg_values_supported
  ),

  /**
   * The authorization server's issuer identifier. It's a URL that uses the
   * "https" scheme and has no query or fragment components.
   */
  issuer,

  jwks_uri: Type.Optional(jwks_uri),

  op_policy_uri: Type.Optional(op_policy_uri),

  op_tos_uri: Type.Optional(op_tos_uri),

  registration_endpoint: Type.Optional(registration_endpoint),

  response_modes_supported: Type.Optional(response_modes_supported),

  response_types_supported: Type.Optional(response_types_supported),

  revocation_endpoint: Type.Optional(revocation_endpoint),

  revocation_endpoint_auth_methods_supported: Type.Optional(
    revocation_endpoint_auth_methods_supported
  ),

  revocation_endpoint_auth_signing_alg_values_supported: Type.Optional(
    revocation_endpoint_auth_signing_alg_values_supported
  ),

  /**
   * JSON array containing a list of the OAuth 2.0 "scope" values that this
   * authorization server supports.
   */
  scopes_supported: Type.Optional(scopes_supported),

  service_documentation: Type.Optional(service_documentation),

  token_endpoint,

  token_endpoint_auth_methods_supported: Type.Optional(
    token_endpoint_auth_methods_supported
  ),

  token_endpoint_auth_signing_alg_values_supported: Type.Optional(
    token_endpoint_auth_signing_alg_values_supported
  ),

  ui_locales_supported: Type.Optional(ui_locales_supported),

  userinfo_endpoint: Type.Optional(userinfo_endpoint)
})

/**
 * [IndieAuth Server Metadata](https://indieauth.spec.indieweb.org/#indieauth-server-metadata)
 */
export type ServerMetadata = Static<typeof server_metadata>
