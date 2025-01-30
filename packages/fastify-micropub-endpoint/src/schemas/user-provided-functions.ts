import { jti } from "@jackdbd/oauth2-tokens";
import { Static, Type } from "@sinclair/typebox";
import { failure, url } from "./common.js";
import { jf2 } from "./jf2.js";

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

const success = Type.Object({
  error: Type.Optional(Type.Undefined()),
  value: Type.Any(),
});

const result_promise = Type.Promise(Type.Union([failure, success]));

export const create = Type.Function([jf2], result_promise);

export type Create = Static<typeof create>;

export const deleteContentOrMedia = Type.Function([url], result_promise);

export type DeleteContentOrMedia = Static<typeof deleteContentOrMedia>;

export const undelete = Type.Function([url], result_promise);

export type Undelete = Static<typeof undelete>;

export const update_patch = Type.Object({
  add: Type.Optional(Type.Any()),
  delete: Type.Optional(Type.String({ minLength: 1 })),
  replace: Type.Optional(Type.Any()),
});

export type UpdatePatch = Static<typeof update_patch>;

export const update = Type.Function([url, update_patch], result_promise);

export type Update = Static<typeof update>;
