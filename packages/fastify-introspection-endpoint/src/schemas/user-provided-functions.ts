import { Static, Type } from '@sinclair/typebox'
import { refresh_token } from '@jackdbd/oauth2'
import { jti } from '@jackdbd/oauth2-tokens'
import {
  access_token_immutable_record,
  access_token_mutable_record
} from './access-token.js'
import {
  refresh_token_immutable_record,
  refresh_token_mutable_record
} from './refresh-token.js'

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
 * Function that retrieves an access token from a storage backend.
 */
export const retrieveAccessToken = Type.Function(
  [jti],
  Type.Promise(
    Type.Union([access_token_immutable_record, access_token_mutable_record])
  ),
  {
    $id: 'retrieve-access-token',
    description: `Function that retrieves an access token from a storage backend.`,
    title: 'retrieveAccessToken'
  }
)

/**
 * Function that retrieves an access token from a storage backend.
 */
export type RetrieveAccessToken = Static<typeof retrieveAccessToken>

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
