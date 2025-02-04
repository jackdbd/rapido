import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import {
  ajv,
  include_error_description,
  log_prefix,
  report_all_ajv_errors,
  request_context_key
} from './common.js'
import {
  isAccessTokenRevoked,
  retrieveUserProfile
} from './user-provided-functions.js'
import type {
  IsAccessTokenRevoked,
  RetrieveUserProfile
} from './user-provided-functions.js'

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked,

    logPrefix: Type.Optional(log_prefix),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    requestContextKey: Type.Optional(request_context_key),

    retrieveUserProfile
  },
  {
    $id: 'fastify-userinfo-endpoint-options',
    description: 'Options for the Fastify userinfo-endpoint plugin',
    title: 'Userinfo Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  isAccessTokenRevoked: IsAccessTokenRevoked
  retrieveUserProfile: RetrieveUserProfile
}
