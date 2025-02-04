import { Static, Type } from '@sinclair/typebox'
import {
  include_error_description,
  log_prefix,
  media_endpoint,
  micropub_endpoint
} from './common.js'
import {
  create,
  deleteContentOrMedia,
  isAccessTokenRevoked,
  undelete,
  update
} from './user-provided-functions.js'
import type {
  Create,
  DeleteContentOrMedia,
  IsAccessTokenRevoked,
  Undelete,
  Update
} from './user-provided-functions.js'

export const micropub_post_config = Type.Object(
  {
    create,
    delete: deleteContentOrMedia,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix: log_prefix,
    mediaEndpoint: media_endpoint,
    micropubEndpoint: micropub_endpoint,
    undelete: Type.Optional(undelete),
    update
  },
  {
    additionalProperties: false,
    $id: 'micropub-endpoint-post-method-config'
  }
)

export interface MicropubPostConfig
  extends Static<typeof micropub_post_config> {
  create: Create
  delete: DeleteContentOrMedia
  isAccessTokenRevoked: IsAccessTokenRevoked
  undelete?: Undelete
  update: Update
}
