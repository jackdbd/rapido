import {
  me_before_url_canonicalization,
  me_after_url_canonicalization
} from '@jackdbd/indieauth/schemas'
import { isAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import type { IsAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import {
  // createPost,
  deletePost,
  undeletePost,
  updatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import type {
  // CreatePost,
  DeletePost,
  UndeletePost,
  UpdatePost
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { DEFAULT } from '../constants.js'
import {
  ajv,
  media_endpoint,
  micropub_endpoint,
  report_all_ajv_errors
} from './common.js'
import { syndicate_to_item } from './syndicate-to.js'
import { createPost, type CreatePost } from './route-micropub-post.js'

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    create: createPost,

    delete: deletePost,

    includeErrorDescription: Type.Optional(
      Type.Boolean({ default: DEFAULT.INCLUDE_ERROR_DESCRIPTION })
    ),

    isAccessTokenRevoked,

    logPrefix: Type.Optional(Type.String({ default: DEFAULT.LOG_PREFIX })),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization
    ]),

    mediaEndpoint: Type.Optional(media_endpoint),

    micropubEndpoint: Type.Optional(micropub_endpoint),

    multipartFormDataMaxFileSize: Type.Optional(
      Type.Number({
        title: 'multipart/form-data max file size',
        description: `Max file size (in bytes) for multipart/form-data requests.`,
        default: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
        minimum: 0
      })
    ),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    syndicateTo: Type.Optional(
      Type.Array(syndicate_to_item, { default: DEFAULT.SYNDICATE_TO })
    ),

    undelete: Type.Optional(undeletePost),

    update: updatePost
  },
  {
    $id: 'fastify-micropub-endpoint-options',
    description: 'Options for the Fastify micropub-endpoint plugin',
    title: 'Micropub Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  create: CreatePost
  delete: DeletePost
  isAccessTokenRevoked: IsAccessTokenRevoked
  undelete?: UndeletePost
  update: UpdatePost
}
