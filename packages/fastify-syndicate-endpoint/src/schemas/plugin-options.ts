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
import {
  include_error_description,
  log_prefix,
  report_all_ajv_errors
} from './common.js'
import { syndicator } from './syndicator.js'

export const options = Type.Object(
  {
    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked,

    logPrefix: Type.Optional(log_prefix),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization
    ]),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    retrievePost,

    syndicators: Type.Array(syndicator),

    updatePost,

    urlToLocation: websiteUrlToStoreLocation
  },
  {
    $id: 'fastify-syndicate-endpoint-options',
    description: 'Options for the Fastify syndicate-endpoint plugin',
    title: 'Syndicate Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  isAccessTokenRevoked: IsAccessTokenRevoked
  retrievePost: RetrievePost
  updatePost: UpdatePost
  urlToLocation: WebsiteUrlToStoreLocation
}
