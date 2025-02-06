import { Static, Type } from '@sinclair/typebox'
import { jf2 } from './jf2.js'
import { location } from './location.js'

export const sha = Type.String({ minLength: 1 })

export const url = Type.String({
  description: 'A URL',
  format: 'uri'
})

// These functions are provided by the user, so I don't think we can draw any
// conclusions about their return type. We can only say that they return a
// promise.

export const deletePost = Type.Function([url], Type.Promise(Type.Any()), {
  title: 'Delete post',
  description:
    '[Deletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.'
})

export type DeletePost = Static<typeof deletePost>

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

export const undeletePost = Type.Function([url], Type.Promise(Type.Any()), {
  title: 'Undelete post',
  description:
    '[Undeletes](https://micropub.spec.indieweb.org/#delete) a post published at a URL.'
})

export type UndeletePost = Static<typeof undeletePost>

export const update_patch = Type.Object({
  add: Type.Optional(Type.Any()),
  delete: Type.Optional(Type.String({ minLength: 1 })),
  replace: Type.Optional(Type.Any())
})

export type UpdatePatch = Static<typeof update_patch>

export const updatePost = Type.Function(
  [url, update_patch],
  Type.Promise(Type.Any()),
  {
    title: 'Update post',
    description:
      '[Updates](https://micropub.spec.indieweb.org/#update) a post published at a URL.'
  }
)

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

export const uploadMediaReturnValue = Type.Object({
  url: Type.String({
    description: 'URL of the uploaded file.',
    format: 'uri'
  })
})

export type UploadMediaReturnValue = Static<typeof uploadMediaReturnValue>

export const uploadMedia = Type.Function(
  [upload_config],
  Type.Promise(uploadMediaReturnValue),
  {
    title: 'Upload file',
    description:
      '[Uploads a file](https://micropub.spec.indieweb.org/#uploading-files) to the Micropub server.'
  }
)

export type UploadMedia = Static<typeof uploadMedia>

export const websiteUrlToStoreLocation = Type.Function(
  [url],
  Type.Promise(location),
  {
    title: 'Website URL to store location',
    description:
      "Maps a URL published on the user's website to a location on the user's store (e.g. a table in a database, a path in a git repository, a URL in a public bucket of an object storage service like AWS S3)."
  }
)

export type WebsiteUrlToStoreLocation = Static<typeof websiteUrlToStoreLocation>
