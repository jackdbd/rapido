import {
  isAccessTokenRevoked,
  type IsAccessTokenRevoked
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import {
  createPost,
  deletePost,
  jf2ToWebsiteUrl,
  undeletePost,
  updatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import type {
  CreatePost,
  DeletePost,
  Jf2ToWebsiteUrl,
  UndeletePost,
  UpdatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { ajv, log_prefix, media_endpoint, micropub_endpoint } from './common.js'

export const micropub_post_config = Type.Object(
  {
    ajv,
    createPost,
    deletePost,
    isAccessTokenRevoked,
    jf2ToWebsiteUrl,
    logPrefix: log_prefix,
    mediaEndpoint: media_endpoint,
    micropubEndpoint: micropub_endpoint,
    undeletePost: Type.Optional(undeletePost),
    updatePost
  },
  {
    additionalProperties: false,
    $id: 'micropub-endpoint-post-method-config'
  }
)

export interface MicropubPostConfig
  extends Static<typeof micropub_post_config> {
  ajv: Ajv
  createPost: CreatePost
  deletePost: DeletePost
  isAccessTokenRevoked: IsAccessTokenRevoked
  jf2ToWebsiteUrl: Jf2ToWebsiteUrl
  undeletePost?: UndeletePost
  updatePost: UpdatePost
}
