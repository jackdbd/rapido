import {
  issuer,
  jwks_url,
  me_after_url_canonicalization
} from '@jackdbd/indieauth/schemas'
import {
  retrieveAccessToken,
  retrieveRefreshToken,
  revokeAccessToken,
  revokeRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import type {
  RetrieveAccessToken,
  RetrieveRefreshToken,
  RevokeAccessToken,
  RevokeRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { ajv, include_error_description, log_prefix } from './common.js'

export const revoke_post_config = Type.Object(
  {
    ajv,
    includeErrorDescription: include_error_description,
    issuer,
    jwksUrl: jwks_url,
    logPrefix: log_prefix,
    maxAccessTokenAge: Type.Optional(Type.String({ minLength: 1 })),
    me: me_after_url_canonicalization,
    retrieveAccessToken,
    retrieveRefreshToken,
    revokeAccessToken,
    revokeRefreshToken
  },
  { additionalProperties: false, $id: 'revocation-endpoint-post-method-config' }
)

export interface RevokePostConfig extends Static<typeof revoke_post_config> {
  ajv: Ajv
  retrieveAccessToken: RetrieveAccessToken
  retrieveRefreshToken: RetrieveRefreshToken
  revokeAccessToken: RevokeAccessToken
  revokeRefreshToken: RevokeRefreshToken
}
