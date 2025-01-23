import { Static, Type } from "@sinclair/typebox";
import { refresh_token } from "@jackdbd/oauth2";
import { jti } from "@jackdbd/oauth2-tokens";
import {
  access_token_immutable_record,
  access_token_mutable_record,
} from "./access-token.js";
import {
  refresh_token_immutable_record,
  refresh_token_mutable_record,
} from "./refresh-token.js";
import { revocation_reason } from "./revocation.js";

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
    title: "isAccessTokenRevoked",
  }
);

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export type IsAccessTokenRevoked = Static<typeof isAccessTokenRevoked>;

/**
 * Function that retrieves an access token from a storage backend.
 */
export const retrieveAccessToken = Type.Function(
  [jti],
  Type.Promise(
    Type.Union([access_token_immutable_record, access_token_mutable_record])
  ),
  {
    $id: "retrieve-access-token",
    description: `Function that retrieves an access token from a storage backend.`,
    title: "retrieveAccessToken",
  }
);

/**
 * Function that retrieves an access token from a storage backend.
 */
export type RetrieveAccessToken = Static<typeof retrieveAccessToken>;

/**
 * Function that retrieves a refresh token from a storage backend.
 */
export const retrieveRefreshToken = Type.Function(
  [refresh_token],
  Type.Promise(
    Type.Union([refresh_token_immutable_record, refresh_token_mutable_record])
  ),
  {
    $id: "retrieve-refresh-token",
    title: "retrieveRefreshToken",
    description: `Function that retrieves a refresh token from a storage backend.`,
  }
);

/**
 * Function that retrieves a refresh token from a storage backend.
 */
export type RetrieveRefreshToken = Static<typeof retrieveRefreshToken>;

export const revoke_refresh_token_props = Type.Object({
  refresh_token,
  revocation_reason: Type.Optional(revocation_reason),
});

export type RevokeRefreshTokenProps = Static<typeof revoke_refresh_token_props>;

export const revokeRefreshToken = Type.Function(
  [revoke_refresh_token_props],
  Type.Promise(Type.Void()),
  {
    title: "revokeRefreshToken",
    description: `Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the refresh token as revoked in your storage backend.`,
  }
);

export type RevokeRefreshToken = Static<typeof revokeRefreshToken>;

export const revoke_access_token_props = Type.Object({
  jti,
  revocation_reason: Type.Optional(revocation_reason),
});

export type RevokeAccessTokenProps = Static<typeof revoke_access_token_props>;

export const revokeAccessToken = Type.Function(
  [revoke_access_token_props],
  Type.Promise(Type.Void()),
  {
    description: `Handler invoked when the token revocation endpoint has met all requirements to revoke a token. You should use it to mark the access token as revoked in your storage backend.`,
    title: "revokeAccessToken",
  }
);

export type RevokeAccessToken = Static<typeof revokeAccessToken>;
