import { Static, Type } from "@sinclair/typebox";
import { jti } from "@jackdbd/oauth2-tokens";

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
