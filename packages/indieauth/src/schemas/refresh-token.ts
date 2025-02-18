import { redirect_uri, refresh_token, scope } from '@jackdbd/oauth2'
import { exp, iss, jti } from '@jackdbd/oauth2-tokens'
import { Static, Type } from '@sinclair/typebox'
import { client_id } from './client-metadata.js'
import { me_after_url_canonicalization } from './me.js'
import { immutable_record, mutable_record } from './record.js'
import { revocation_reason, revoked } from './revocation.js'

export const refresh_token_props = Type.Object(
  {
    /**
     * Identifier of the application that requested the token.
     */
    client_id,
    /**
     * Expiration of the token (in seconds from UNIX epoch).
     */
    exp,
    /**
     * Identifier of the token endpoint of the authorization server that issued
     * the token. I think it makes sense to store this information, in case the
     * authorization server has multiple token endpoints.
     */
    iss,
    /**
     * Identifier of the access token this refresh token is associated with.
     * TODO: clarify if this jti always refers to the **first** access token
     * this refresh token was generated from, or if it refers to the most recent
     * **refreshed** access token. Re-read "automatic reuse detection" in this article:
     * https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/#Refresh-Token-Automatic-Reuse-Detection
     */
    jti,
    me: me_after_url_canonicalization,
    redirect_uri,
    refresh_token,
    revoked: Type.Optional(revoked),
    revocation_reason: Type.Optional(revocation_reason),
    scope
  },
  {
    $id: 'refresh-token-props',
    additionalProperties: false,
    description: 'Properties of a refresh token',
    title: 'Refresh Token Props'
  }
)

export type RefreshTokenProps = Static<typeof refresh_token_props>

export const refresh_token_immutable_record = Type.Object(
  {
    ...immutable_record.properties,
    ...refresh_token_props.properties
  },
  {
    $id: 'refresh-token-immutable-record',
    additionalProperties: false,
    description: `Represents a record of a refresh token. The values of this record should never change. Any updates to the underlying entity should create a new record.`,
    title: 'Refresh Token Immutable Record'
  }
)

export type RefreshTokenImmutableRecord = Static<
  typeof refresh_token_immutable_record
>

export const refresh_token_mutable_record = Type.Object(
  {
    ...mutable_record.properties,
    ...refresh_token_props.properties
  },
  {
    $id: 'refresh-token-mutable-record',
    additionalProperties: false,
    description: `Represents a record of a refresh token with a predefined set of properties (columns). While the structure of the record remains consistent, the values of these properties may change over time.`,
    title: 'Refresh Token Mutable Record'
  }
)

export type RefreshTokenMutableRecord = Static<
  typeof refresh_token_mutable_record
>
