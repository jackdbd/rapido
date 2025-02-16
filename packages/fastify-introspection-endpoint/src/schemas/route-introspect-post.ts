import { issuer, jwks_url } from '@jackdbd/indieauth/schemas'
import {
  isAccessTokenRevoked,
  isRefreshTokenRevoked,
  retrieveAccessToken,
  retrieveRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import type {
  IsAccessTokenRevoked,
  IsRefreshTokenRevoked,
  RetrieveAccessToken,
  RetrieveRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { ajv, include_error_description, log_prefix } from './common.js'

export const introspect_post_config = Type.Object(
  {
    ajv,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    isRefreshTokenRevoked,
    issuer,
    jwks_url,
    logPrefix: log_prefix,
    // maxAccessTokenAge: Type.String({ minLength: 1 }),
    retrieveAccessToken,
    retrieveRefreshToken
  },
  {
    additionalProperties: false,
    $id: 'introspection-endpoint-post-method-config'
  }
)

export interface IntrospectPostConfig
  extends Static<typeof introspect_post_config> {
  ajv: Ajv
  isAccessTokenRevoked: IsAccessTokenRevoked
  isRefreshTokenRevoked: IsRefreshTokenRevoked
  retrieveAccessToken: RetrieveAccessToken
  retrieveRefreshToken: RetrieveRefreshToken
}
