import { Static, Type } from '@sinclair/typebox'
import { jf2 } from './jf2.js'
import { location } from './location.js'

export const sha = Type.String({ minLength: 1 })

export const url = Type.String({ format: 'uri' })

const summary = Type.String({
  minLength: 1,
  title: 'Summary',
  description: 'Summary of the operation.'
})

const detail = Type.String({
  minLength: 1,
  description: 'Some detail of the operation.'
})

const details = Type.Optional(Type.Array(detail))

/**
 * Outcome of a create operation at the Micropub/Media endpoint.
 */
export const outcome_create = Type.Object({ details, summary })

export type OutcomeCreate = Static<typeof outcome_create>

export const createPost = Type.Function([jf2], Type.Promise(outcome_create), {
  title: 'Create post',
  description:
    '[Creates](https://micropub.spec.indieweb.org/#create) a post on the Micropub server.'
})

/**
 * Creates a post on the Micropub server.
 *
 * @see [Create - Micropub spec](https://micropub.spec.indieweb.org/#create)
 */
export type CreatePost = Static<typeof createPost>

/**
 * Outcome of a delete/undelete operation at the Micropub/Media endpoint.
 */
export const outcome_delete = Type.Object({ details, summary })

export type OutcomeDelete = Static<typeof outcome_delete>

export const deletePost = Type.Function([url], Type.Promise(outcome_delete), {
  title: 'Delete post',
  description:
    '[Deletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.'
})

/**
 * Deletes a post published at a URL.
 *
 * @see [Delete - Micropub spec](https://micropub.spec.indieweb.org/#delete)
 */
export type DeletePost = Static<typeof deletePost>

export const deleteMedia = Type.Function([url], Type.Promise(outcome_delete), {
  title: 'Delete media',
  description: 'Deletes a file published at a URL.'
})

export type DeleteMedia = Static<typeof deleteMedia>

export const retrievePost = Type.Function(
  [location],
  Type.Promise(
    Type.Object({
      jf2,
      sha: Type.Optional(sha)
    })
  ),
  {
    title: 'retrieveContent',
    description: 'Retrieves a post from the Micropub server.'
  }
)

export type RetrievePost = Static<typeof retrievePost>

export const undeletePost = Type.Function([url], Type.Promise(outcome_delete), {
  title: 'Undelete post',
  description:
    '[Undeletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.'
})

/**
 * Undeletes a post published at a URL.
 *
 * @see [Delete - Micropub spec](https://micropub.spec.indieweb.org/#delete)
 */
export type UndeletePost = Static<typeof undeletePost>

export const update_patch = Type.Object({
  add: Type.Optional(Type.Any()),
  delete: Type.Optional(Type.String({ minLength: 1 })),
  replace: Type.Optional(Type.Any())
})

export type UpdatePatch = Static<typeof update_patch>

export const updatePost = Type.Function(
  [url, update_patch],
  Type.Promise(Type.Void()),
  {
    title: 'Update post',
    description:
      '[Updates](https://micropub.spec.indieweb.org/#update) a post published at a URL.'
  }
)

/**
 * Updates a post published at a URL.
 *
 * @see [Update - Micropub spec](https://micropub.spec.indieweb.org/#update)
 */
export type UpdatePost = Static<typeof updatePost>

export const upload_config = Type.Object({
  body: Type.Any({ description: 'The file to upload.' }),
  contentType: Type.String({
    description:
      'Content-Type of the file being uploaded to the Media endpoint.'
  }),
  filename: Type.String({
    description:
      'Name of the file being uploaded to the Media endpoint. The Media Endpoint MAY ignore the suggested filename that the client sends.'
  })
})

export interface UploadConfig extends Static<typeof upload_config> {
  body: Buffer
}

/**
 * Outcome of an upload operation at the Media endpoint.
 */
export const outcome_upload = Type.Object({ details, summary, url })

export type OutcomeUpload = Static<typeof outcome_upload>

export const uploadMedia = Type.Function(
  [upload_config],
  Type.Promise(outcome_upload),
  {
    title: 'Upload file',
    description:
      '[Uploads a file](https://micropub.spec.indieweb.org/#uploading-files) to the Micropub server.'
  }
)

/**
 * Uploads a file to the Micropub server.
 *
 * @see [Uploading Files - Micropub spec](https://micropub.spec.indieweb.org/#uploading-files)
 */
export type UploadMedia = Static<typeof uploadMedia>

export const jf2ToLocation = Type.Function([jf2], location, {
  title: 'JF2 to store/website location',
  description:
    "Maps a JF2 object to a location in the store and a URL published on (or that it will be published to) the user's website."
})

/**
 * Maps a JF2 object to a location in the store and a URL published on (or that
 * it will be published to) the user's website.
 */
export type Jf2ToLocation = Static<typeof jf2ToLocation>

export const websiteUrlToStoreLocation = Type.Function([url], location, {
  title: 'Website URL to store location',
  description:
    "Maps a URL published on the user's website to a location on the user's store (e.g. a table in a database, a path in a git repository, a URL in a public bucket of an object storage service like AWS S3)."
})

/**
 * Maps a URL published on the user's website to a location on the user's store.
 *
 * The store in question could be:
 *
 * - a table in a database (URL -> record)
 * - a git repository (URL -> path)
 * - a public bucket of an object storage service like AWS S3 (URL -> URL)
 */
export type WebsiteUrlToStoreLocation = Static<typeof websiteUrlToStoreLocation>
