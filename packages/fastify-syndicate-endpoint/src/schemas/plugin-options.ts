import {
  me_before_url_canonicalization,
  me_after_url_canonicalization
} from '@jackdbd/indieauth/schemas'
import { isAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import type { IsAccessTokenRevoked } from '@jackdbd/indieauth/schemas/user-provided-functions'
import {
  retrievePost,
  updatePost,
  websiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import type {
  RetrievePost,
  UpdatePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'

import { DEFAULT } from '../constants.js'
import {
  ajv,
  include_error_description,
  report_all_ajv_errors
} from './common.js'

// import type { Syndicator } from '../../lib/micropub/index.js'
// syndicators: { [uid: string]: Syndicator }

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    get: retrievePost,

    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked,

    logPrefix: Type.Optional(Type.String({ default: DEFAULT.LOG_PREFIX })),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization
    ]),

    publishedUrlToStorageLocation: websiteUrlToStoreLocation,

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    syndicators: Type.Any(),

    update: updatePost
  },
  {
    $id: 'fastify-syndicate-endpoint-options',
    description: 'Options for the Fastify syndicate-endpoint plugin',
    title: 'Syndicate Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  get: RetrievePost
  isAccessTokenRevoked: IsAccessTokenRevoked
  publishedUrlToStorageLocation: WebsiteUrlToStoreLocation
  update: UpdatePost
}
