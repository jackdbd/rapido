import { Static, Type } from '@sinclair/typebox'
import { refresh_token } from '@jackdbd/oauth2'
import { jti, tokens_plus_info } from '@jackdbd/oauth2-tokens'
import {
  refresh_token_immutable_record,
  refresh_token_mutable_record
} from './refresh-token.js'
import { revocation_reason } from './revocation.js'

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export const isAccessTokenRevoked = Type.Function(
  [jti],
  Type.Promise(Type.Boolean()),
  {
    description: `Predicate function that returns true if a jti (JSON Web Token ID) is revoked.`,
    title: 'isAccessTokenRevoked'
  }
)

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export type IsAccessTokenRevoked = Static<typeof isAccessTokenRevoked>

/**
 * Handler invoked when the token endpoint has issued an access token and a
 * refresh token. You should use it to persist the tokens to storage.
 */
export const onIssuedTokens = Type.Function(
  [tokens_plus_info],
  Type.Promise(Type.Void()),
  {
    $id: 'on-issued-tokens',
    title: 'onIssuedTokens',
    description: `Handler invoked when the token endpoint has issued an access token and a refresh token. You should use this handler to persist the tokens to some storage (e.g. a database).`
  }
)

export type OnIssuedTokens = Static<typeof onIssuedTokens>

/**
 * Function that retrieves a refresh token from a storage backend.
 */
export const retrieveRefreshToken = Type.Function(
  [refresh_token],
  Type.Promise(
    Type.Union([refresh_token_immutable_record, refresh_token_mutable_record])
  ),
  {
    $id: 'retrieve-refresh-token',
    title: 'retrieveRefreshToken',
    description: `Function that retrieves a refresh token from a storage backend.`
  }
)

/**
 * Function that retrieves a refresh token from a storage backend.
 */
export type RetrieveRefreshToken = Static<typeof retrieveRefreshToken>

const revoke_refresh_token_props = Type.Object({
  refresh_token,
  revocation_reason: Type.Optional(revocation_reason)
})

export type RevokeRefreshTokenProps = Static<typeof revoke_refresh_token_props>

export const revokeRefreshToken = Type.Function(
  [revoke_refresh_token_props],
  Type.Promise(Type.Void()),
  {
    title: 'revokeRefreshToken',
    description: `Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the refresh token as revoked in your storage backend.`
  }
)

export type RevokeRefreshToken = Static<typeof revokeRefreshToken>

const revoke_access_token_props = Type.Object({
  jti,
  revocation_reason: Type.Optional(revocation_reason)
})

export type RevokeAccessTokenProps = Static<typeof revoke_access_token_props>

export const revokeAccessToken = Type.Function(
  [revoke_access_token_props],
  Type.Promise(Type.Void()),
  {
    description: `Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the access token as revoked in your storage backend.`,
    title: 'revokeAccessToken'
  }
)

export type RevokeAccessToken = Static<typeof revokeAccessToken>
