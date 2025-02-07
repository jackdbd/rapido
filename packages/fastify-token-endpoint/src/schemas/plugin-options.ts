import { issuer, userinfo_endpoint } from '@jackdbd/indieauth/schemas'
import {
  authorization_endpoint,
  expiration,
  isAccessTokenRevoked,
  jwks_private,
  onIssuedTokens,
  retrieveRefreshToken,
  revocation_endpoint
} from '@jackdbd/indieauth/schemas'
import type {
  IsAccessTokenRevoked,
  OnIssuedTokens,
  RetrieveRefreshToken
} from '@jackdbd/indieauth/schemas'
import { Static, Type } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import { DEFAULT } from '../constants.js'
import {
  ajv,
  include_error_description,
  log_prefix,
  report_all_ajv_errors
} from './common.js'

export const options = Type.Object(
  {
    /**
     * Human-readable expiration time for the access token. It will be shown in
     * the consent screen.
     *
     * @example '15 minutes'
     */
    accessTokenExpiration: Type.Optional(
      Type.String({
        ...expiration,
        default: DEFAULT.ACCESS_TOKEN_EXPIRATION
      })
    ),

    /**
     * AJV instance, for validation.
     */
    ajv: Type.Optional(ajv),

    /**
     * Endpoint that will be called to verify an authorization code before
     * issuing a token.
     */
    authorizationEndpoint: authorization_endpoint,

    includeErrorDescription: Type.Optional(include_error_description),

    /**
     * Predicate function that will be called to check whether a previously
     * issued token is revoked or not.
     */
    isAccessTokenRevoked,

    issuer,

    jwks: Type.Object(
      { ...jwks_private.properties },
      {
        description:
          'Private JSON Web Key Set (JWKS). The access token issued by this token endpoint will be signed using a JWK randomly chosen from this set.'
      }
    ),

    logPrefix: Type.Optional(log_prefix),

    onIssuedTokens,

    /**
     * Human-readable expiration time for the refresh token. It will be shown in
     * the consent screen.
     *
     * @example '30 days'
     */
    refreshTokenExpiration: Type.Optional(
      Type.String({
        ...expiration,
        default: DEFAULT.REFRESH_TOKEN_EXPIRATION
      })
    ),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    retrieveRefreshToken,

    revocationEndpoint: revocation_endpoint,

    userinfoEndpoint: userinfo_endpoint
  },
  {
    $id: 'fastify-token-endpoint-options',
    description: 'Options for the Fastify token-endpoint plugin',
    title: 'Token Endpoint Options'
    // jsonschema2mk keeps outputting an example even if I explicitly set it to
    // an empty array, an empty string, null, undefined, etc.
    // examples: [],
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  isAccessTokenRevoked: IsAccessTokenRevoked
  onIssuedTokens: OnIssuedTokens
  retrieveRefreshToken: RetrieveRefreshToken
}
