import { issuer, userinfo_endpoint } from '@jackdbd/indieauth/schemas'
import {
  onIssuedTokens,
  retrieveRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import type {
  OnIssuedTokens,
  RetrieveRefreshToken
} from '@jackdbd/indieauth/schemas/user-provided-functions'
import { authorization_endpoint, revocation_endpoint } from '@jackdbd/oauth2'
import { expiration, jwks_private } from '@jackdbd/oauth2-tokens'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { ajv, include_error_description, log_prefix } from './common.js'

export const token_post_config = Type.Object(
  {
    accessTokenExpiration: expiration,

    ajv,

    authorizationEndpoint: authorization_endpoint,

    includeErrorDescription: include_error_description,

    issuer,

    jwks: jwks_private,

    logPrefix: log_prefix,

    onIssuedTokens,

    refreshTokenExpiration: expiration,

    retrieveRefreshToken,

    revocationEndpoint: revocation_endpoint,

    userinfoEndpoint: userinfo_endpoint
  },
  { additionalProperties: false, $id: 'token-endpoint-post-method-config' }
)

export interface TokenPostConfig extends Static<typeof token_post_config> {
  ajv: Ajv
  onIssuedTokens: OnIssuedTokens
  retrieveRefreshToken: RetrieveRefreshToken
}
