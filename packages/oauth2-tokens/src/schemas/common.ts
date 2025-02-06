import { Type } from '@sinclair/typebox'

export const ajv = Type.Any({ description: 'Instance of Ajv' })

/**
 * The ID of the application that asks for authorization.
 *
 * An IndieAuth client ID is always a URL.
 */
export const client_id = Type.String({
  description:
    'The ID of the application that asks for authorization. An IndieAuth client ID is a URL.',
  format: 'uri'
})

export const expiration = Type.String({
  description: `Human-readable expiration time for the token issued by the token endpoint.`,
  minLength: 1,
  title: 'Token expiration',
  examples: ['60 seconds', '5 minutes', '1 hour', '30 days']
})

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

/**
 * Profile URL (after [URL Canonicalization](https://indieauth.spec.indieweb.org/#url-canonicalization)).
 */
export const me_after_url_canonicalization = Type.String({
  description: `Profile URL (after URL Canonicalization)`,
  format: 'uri',
  title: 'me (canonicalized)'
})
