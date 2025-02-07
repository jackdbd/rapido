import { Static, Type } from '@sinclair/typebox'
import { client_id } from './client-application.js'
import { redirect_uri } from './common.js'

/**
 * Human readable name of the client to be presented on the consent screen.
 */
export const client_name = Type.String({ minLength: 1 })

/**
 * URL of a webpage providing information about the client.
 */
export const client_uri = Type.String({ format: 'uri' })

/**
 * URL that references a logo or icon for the client.
 */
export const logo_uri = Type.String({ format: 'uri' })

/**
 * An array of redirect URIs.
 */
export const redirect_uris = Type.Array(redirect_uri, { minItems: 1 })

/**
 * IndieAuth client metadata.
 *
 * @see [Client Metadata - IndieAuth spec](https://indieauth.spec.indieweb.org/#client-metadata)
 * @see [OAuth 2.0 Dynamic Client Registration Protocol (RFC7591)](https://datatracker.ietf.org/doc/html/rfc7591)
 */
export const client_metadata = Type.Object(
  {
    /**
     * The client identifier. The authorization server MUST verify that the
     * client_id in the document matches the client_id of the URL where the
     * document was retrieved.
     */
    client_id,

    /**
     * Human readable name of the client to be presented on the consent screen.
     */
    client_name: Type.Optional(client_name),

    /**
     * URL of a webpage providing information about the client.
     *
     * The client_uri MUST be a prefix of the client_id.
     */
    client_uri,

    /**
     * URL that references a logo or icon for the client.
     */
    logo_uri: Type.Optional(logo_uri),

    /**
     * An array of redirect URIs.
     */
    redirect_uris: Type.Optional(redirect_uris)
  },
  {
    description:
      'IndieAuth clients SHOULD have a JSON document at their client_id URL containing client metadata defined in RFC7591.'
  }
)

export type ClientMetadata = Static<typeof client_metadata>
