import { Static, Type } from '@sinclair/typebox'
import {
  me_before_url_canonicalization,
  me_after_url_canonicalization
} from '@jackdbd/indieauth'
import type { Ajv } from 'ajv'

import { DEFAULT } from '../constants.js'
import {
  ajv,
  include_error_description,
  report_all_ajv_errors
} from './common.js'
import {
  isAccessTokenRevoked,
  retrieveContent,
  update,
  websiteUrlToStoreLocation
} from './user-provided-functions.js'
import type {
  IsAccessTokenRevoked,
  RetrieveContent,
  Update,
  WebsiteUrlToStoreLocation
} from './user-provided-functions.js'

// import type { Syndicator } from '../../lib/micropub/index.js'
// syndicators: { [uid: string]: Syndicator }

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    get: retrieveContent,

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

    update
  },
  {
    $id: 'fastify-syndicate-endpoint-options',
    description: 'Options for the Fastify syndicate-endpoint plugin',
    title: 'Syndicate Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  get: RetrieveContent
  isAccessTokenRevoked: IsAccessTokenRevoked
  publishedUrlToStorageLocation: WebsiteUrlToStoreLocation
  update: Update
}
