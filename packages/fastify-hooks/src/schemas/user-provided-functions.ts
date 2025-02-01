import { Static, Type } from "@sinclair/typebox";

// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
export const jti = Type.String({
  description: `Unique identifier for the JWT`,
  minLength: 1,
  title: '"jti" (JWT ID) Claim',
});

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export const isAccessTokenRevoked = Type.Function(
  [jti],
  Type.Promise(Type.Boolean()),
  {
    title: "isAccessTokenRevoked",
    description: `Predicate function that returns true if a jti (JSON Web Token ID) is revoked.`,
  }
);

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export type IsAccessTokenRevoked = Static<typeof isAccessTokenRevoked>;
