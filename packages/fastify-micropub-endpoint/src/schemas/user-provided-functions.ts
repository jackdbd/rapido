import { jti } from "@jackdbd/oauth2-tokens";
import { Static, Type } from "@sinclair/typebox";
import { url } from "./common.js";
import { jf2 } from "./jf2.js";
import { update_patch } from "./update-patch.js";

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

// const success = Type.Object({
//   error: Type.Optional(Type.Undefined()),
//   value: Type.Any(),
// });

// const result_promise = Type.Promise(Type.Union([failure, success]));

// These functions are provided by the user, so I don't think we can draw any
// conclusions about their return type. We can only say that they return a
// promise.

export const create = Type.Function([jf2], Type.Promise(Type.Any()), {
  title: "create",
  description:
    "[Creates](https://micropub.spec.indieweb.org/#create) a post on the Micropub server.",
});

/**
 * Creates a post on the Micropub server.
 *
 * @see [Create - Micropub](https://micropub.spec.indieweb.org/#create)
 */
export type Create = Static<typeof create>;

export const deleteContentOrMedia = Type.Function(
  [url],
  Type.Promise(Type.Any()),
  {
    title: "delete",
    description:
      "[Deletes](https://micropub.spec.indieweb.org/#delete) a post or media from the Micropub server.",
  }
);

/**
 * Deletes a post or media from the Micropub server.
 *
 * @see [Delete - Micropub](https://micropub.spec.indieweb.org/#delete)
 */
export type DeleteContentOrMedia = Static<typeof deleteContentOrMedia>;

export const undelete = Type.Function([url], Type.Promise(Type.Any()), {
  title: "undelete",
  description:
    "[Undeletes](https://micropub.spec.indieweb.org/#delete) a post or media from the Micropub server.",
});

/**
 * Undeletes a post or media from the Micropub server.
 *
 * @see [Delete - Micropub](https://micropub.spec.indieweb.org/#delete)
 */
export type Undelete = Static<typeof undelete>;

export const update = Type.Function(
  [url, update_patch],
  Type.Promise(Type.Any()),
  {
    title: "update",
    description:
      "[Updates](https://micropub.spec.indieweb.org/#update) a post on the Micropub server.",
  }
);

/**
 * Updates a post on the Micropub server.
 *
 * @see [Update - Micropub](https://micropub.spec.indieweb.org/#update)
 */
export type Update = Static<typeof update>;
