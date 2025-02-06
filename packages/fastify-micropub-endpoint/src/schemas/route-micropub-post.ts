import { isAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import type { IsAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import { jf2 } from '@jackdbd/micropub/schemas'
import {
  deletePost,
  undeletePost,
  updatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import type {
  DeletePost,
  UndeletePost,
  UpdatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import {
  include_error_description,
  log_prefix,
  media_endpoint,
  micropub_endpoint
} from './common.js'

export const createPost = Type.Function([jf2], Type.Promise(Type.Any()), {
  title: 'Create post',
  description:
    '[Creates](https://micropub.spec.indieweb.org/#create) a post on the Micropub server.'
})

/**
 * Creates a post on the Micropub server.
 *
 * @see [Create - Micropub](https://micropub.spec.indieweb.org/#create)
 */
export type CreatePost = Static<typeof createPost>

export const micropub_post_config = Type.Object(
  {
    create: createPost,
    delete: deletePost,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix: log_prefix,
    mediaEndpoint: media_endpoint,
    micropubEndpoint: micropub_endpoint,
    undelete: Type.Optional(undeletePost),
    update: updatePost
  },
  {
    additionalProperties: false,
    $id: 'micropub-endpoint-post-method-config'
  }
)

export interface MicropubPostConfig
  extends Static<typeof micropub_post_config> {
  create: CreatePost
  delete: DeletePost
  isAccessTokenRevoked: IsAccessTokenRevoked
  undelete?: UndeletePost
  update: UpdatePost
}
