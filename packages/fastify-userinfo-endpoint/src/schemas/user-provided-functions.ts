import { me_after_url_canonicalization } from "@jackdbd/indieauth";
import { jti } from "@jackdbd/oauth2-tokens";
import { Static, Type } from "@sinclair/typebox";
import {
  user_profile_immutable_record,
  user_profile_mutable_record,
} from "./user-profile.js";

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
 * Function that retrieves a user's profile from a storage backend.
 */
export const retrieveUserProfile = Type.Function(
  [me_after_url_canonicalization],
  Type.Promise(
    Type.Union([user_profile_immutable_record, user_profile_mutable_record])
  ),
  {
    $id: "retrieve-user-profile",
    description: `Function that retrieves a user's profile from a storage backend.`,
    title: "retrieveUserProfile",
  }
);

/**
 * Function that retrieves a user's profile from a storage backend.
 */
export type RetrieveUserProfile = Static<typeof retrieveUserProfile>;
