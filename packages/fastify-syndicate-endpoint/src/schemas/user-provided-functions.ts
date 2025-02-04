import { location } from '@jackdbd/micropub'
import { Static, Type } from '@sinclair/typebox'
import { jti, sha, url } from './common.js'
import { jf2 } from './jf2.js'
import { update_patch } from './update-patch.js'

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export const isAccessTokenRevoked = Type.Function(
  [jti],
  Type.Promise(Type.Boolean()),
  {
    title: 'isAccessTokenRevoked',
    description: `Predicate function that returns true if a jti (JSON Web Token ID) is revoked.`
  }
)

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export type IsAccessTokenRevoked = Static<typeof isAccessTokenRevoked>

// These functions are provided by the user, so I don't think we can draw any
// conclusions about their return type. We can only say that they return a
// promise.

// TODO: decide the name, either "retrieveContent" or "retrievePost"
export const retrieveContent = Type.Function(
  [location],
  Type.Promise(
    Type.Object({
      jf2,
      sha: Type.Optional(sha)
    })
  ),
  {
    title: 'retrieveContent',
    description: 'Function that retrieves a post from the Micropub server.'
  }
)

export type RetrieveContent = Static<typeof retrieveContent>

export const update = Type.Function(
  [url, update_patch],
  Type.Promise(Type.Any()),
  {
    title: 'update',
    description:
      '[Updates](https://micropub.spec.indieweb.org/#update) a post on the Micropub server.'
  }
)

/**
 * Updates a post on the Micropub server.
 *
 * @see [Update - Micropub](https://micropub.spec.indieweb.org/#update)
 */
export type Update = Static<typeof update>

export const websiteUrlToStoreLocation = Type.Function(
  [url],
  Type.Promise(location),
  {
    title: 'websiteUrlToStoreLocation',
    description:
      "Function that maps a URL published on the user's website, to a location on the user's store (e.g. a table in a database, a path in a git repository, a URL in a public bucket of an object storage service like AWS S3)."
  }
)

export type WebsiteUrlToStoreLocation = Static<typeof websiteUrlToStoreLocation>
