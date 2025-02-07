import { conformResult } from '@jackdbd/schema-validators'
import { Type, type Static } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import ms, { StringValue } from 'ms'
import { randomKid } from './random-kid.js'
import {
  access_token,
  ajv,
  expiration,
  expires_in,
  issuer,
  jwks_private,
  kid,
  me_after_url_canonicalization,
  scope
} from './schemas/index.js'
import { sign } from './sign-jwt.js'

export const config_schema = Type.Object(
  {
    ajv,
    expiration,
    issuer,
    jwks: jwks_private,
    me: me_after_url_canonicalization,
    scope
  },
  { additionalProperties: false }
)

export interface Config extends Static<typeof config_schema> {
  ajv: Ajv
}

export const access_token_plus_info = Type.Object(
  { access_token, expires_in, kid },
  { additionalProperties: false }
)

export type AccessTokenPlusInfo = Static<typeof access_token_plus_info>

export const accessToken = async (config: Config) => {
  const ajv = config.ajv

  const { error: config_conform_error, value: config_validated } =
    conformResult(
      {
        ajv,
        schema: config_schema,
        data: config
      },
      { basePath: 'accessToken-config' }
    )

  if (config_conform_error) {
    return { error: config_conform_error }
  }

  const { expiration, issuer, jwks, me, scope } = config_validated.validated

  const { error: kid_error, value: kid } = randomKid(jwks.keys)

  if (kid_error) {
    return { error: kid_error }
  }

  const { error: sign_error, value: access_token } = await sign({
    expiration,
    issuer,
    jwks,
    kid,
    payload: { me, scope }
  })

  if (sign_error) {
    return { error: sign_error }
  }

  const expires_in = Math.floor(ms(expiration as StringValue) / 1000)

  const value = { access_token, expires_in, kid }

  const { error: return_value_conform_error, value: return_value_validated } =
    conformResult(
      {
        ajv,
        schema: access_token_plus_info,
        data: value
      },
      { basePath: 'accessToken-return-value' }
    )

  if (return_value_conform_error) {
    return { error: return_value_conform_error }
  }

  return { value: return_value_validated.validated }
}
