import { Type, type Static } from '@sinclair/typebox'
import type { Ajv } from 'ajv'
import ms, { StringValue } from 'ms'
import { nanoid } from 'nanoid'
import { conformResult } from '@jackdbd/schema-validators'
import { unixTimestampInMs } from './date.js'
import { ajv, exp, expiration, refresh_token } from './schemas/index.js'

export const config_schema = Type.Object(
  { ajv, expiration },
  { additionalProperties: false }
)

export interface Config extends Static<typeof config_schema> {
  ajv: Ajv
}

export const refresh_token_plus_info = Type.Object(
  {
    exp,
    refresh_token
  },
  { additionalProperties: false }
)

export type RefreshTokenPlusInfo = Static<typeof refresh_token_plus_info>

export const refreshToken = async (config: Config) => {
  const ajv = config.ajv

  const { error: config_conform_error, value: config_validated } =
    conformResult(
      {
        ajv,
        schema: config_schema,
        data: config
      },
      { basePath: 'refreshToken-config' }
    )

  if (config_conform_error) {
    return { error: config_conform_error }
  }

  const { expiration } = config_validated.validated

  const exp = Math.floor(
    (unixTimestampInMs() + ms(expiration as StringValue)) / 1000
  )

  const value = { refresh_token: nanoid(), exp }

  const { error: return_value_conform_error, value: return_value_validated } =
    conformResult(
      {
        ajv,
        schema: refresh_token_plus_info,
        data: value
      },
      { basePath: 'refreshToken-return-value' }
    )

  if (return_value_conform_error) {
    return { error: return_value_conform_error }
  }

  return { value: return_value_validated.validated }
}
