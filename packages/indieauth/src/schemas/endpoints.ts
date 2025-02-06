import { Type } from '@sinclair/typebox'

/**
 * @see [OAuth 2.0 Dynamic Client Registration Protocol (RFC 7591)](https://www.rfc-editor.org/rfc/rfc7591)
 */
export const registration_endpoint = Type.String({
  format: 'uri',
  title: 'Registration endpoint',
  description: `URL of the authorization server's OAuth 2.0 Dynamic Client Registration endpoint.`
})

/**
 * URL of the IndieAuth server's [User Information](https://indieauth.spec.indieweb.org/#user-information) endpoint.
 */
export const userinfo_endpoint = Type.String({
  format: 'uri',
  title: 'Userinfo endpoint',
  description: `URL of the IndieAuth server's [User Information](https://indieauth.spec.indieweb.org/#user-information) endpoint.`
})
