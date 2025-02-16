import {
  issuer,
  jwks_url,
  me_after_url_canonicalization,
  me_before_url_canonicalization
} from '@jackdbd/indieauth/schemas'
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
import {
  ajv,
  include_error_description,
  log_prefix,
  report_all_ajv_errors
} from './common.js'

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked,

    isRefreshTokenRevoked,

    issuer,

    jwksUrl: jwks_url,

    logPrefix: Type.Optional(log_prefix),

    // maxAccessTokenAge: Type.Optional(Type.String({ minLength: 1 })),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization
    ]),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    retrieveAccessToken,

    retrieveRefreshToken
  },
  {
    $id: 'fastify-introspection-endpoint-options',
    description: 'Options for the Fastify introspection-endpoint plugin',
    title: 'Introspection Endpoint Options'
  }
)

export interface Options extends Static<typeof options> {
  ajv?: Ajv
  isAccessTokenRevoked: IsAccessTokenRevoked
  isRefreshTokenRevoked: IsRefreshTokenRevoked
  retrieveAccessToken: RetrieveAccessToken
  retrieveRefreshToken: RetrieveRefreshToken
}
