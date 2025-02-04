import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import {
  ajv,
  include_error_description,
  log_prefix,
  request_context_key
} from './common.js'
import { retrieveUserProfile } from './user-provided-functions.js'
import type { RetrieveUserProfile } from './user-provided-functions.js'

export const userinfo_get_config = Type.Object(
  {
    ajv,
    includeErrorDescription: include_error_description,
    logPrefix: log_prefix,
    requestContextKey: Type.Optional(request_context_key),
    retrieveUserProfile
  },
  {
    additionalProperties: false,
    $id: 'userinfo-endpoint-get-method-config'
  }
)

export interface UserinfoGetConfig extends Static<typeof userinfo_get_config> {
  ajv: Ajv
  retrieveUserProfile: RetrieveUserProfile
}
