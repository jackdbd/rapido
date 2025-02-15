import formbody from '@fastify/formbody'
import responseValidation from '@fastify/response-validation'
import { error_response } from '@jackdbd/indieauth/schemas'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Type } from '@sinclair/typebox'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { DEFAULT, NAME } from './constants.js'
import { defTokenPost } from './routes/token-post.js'
import {
  access_token_request_body,
  access_token_response_body_success,
  options as options_schema,
  refresh_request_body,
  type Options
} from './schemas/index.js'

export {
  access_token_request_body,
  access_token_response_body_success,
  options as plugin_options,
  refresh_request_body
} from './schemas/index.js'
export type {
  AccessTokenRequestBody,
  AccessTokenResponseBodySuccess,
  Options as PluginOptions,
  RefreshRequestBody
} from './schemas/index.js'

const defaults = {
  accessTokenExpiration: DEFAULT.ACCESS_TOKEN_EXPIRATION,
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  refreshTokenExpiration: DEFAULT.REFRESH_TOKEN_EXPIRATION,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS
}

const REQUIRED = [
  'isAccessTokenRevoked',
  'onIssuedTokens',
  'retrieveRefreshToken',
  'authorizationEndpoint',
  'issuer'
] as const

/**
 * Adds an IndieAuth Token Endpoint to a Fastify server.
 */
const tokenEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign({}, defaults, options)

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      return done(new Error(`${config.logPrefix}option ${k} is required`))
    }
  })

  let ajv: Ajv
  if (config.ajv) {
    ajv = config.ajv
  } else {
    // I have no idea why I have to do this to make TypeScript happy.
    // In JavaScript, Ajv and addFormats can be imported without any of this mess.
    const addFormatsPlugin = addFormats as any as AjvPlugin<string[]>
    ajv = addFormatsPlugin(
      new Ajv({ allErrors: config.reportAllAjvErrors, schemas: [] }),
      ['email', 'uri']
    )
  }

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: 'token-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    accessTokenExpiration,
    authorizationEndpoint,
    includeErrorDescription: include_error_description,
    // isAccessTokenRevoked,
    issuer,
    jwks,
    logPrefix,
    onIssuedTokens,
    refreshTokenExpiration,
    retrieveRefreshToken,
    revocationEndpoint,
    userinfoEndpoint
  } = value.validated as Required<Options>

  fastify.log.debug(
    `${logPrefix}access token expiration: ${accessTokenExpiration}`
  )
  fastify.log.debug(
    `${logPrefix}refresh token expiration: ${refreshTokenExpiration}`
  )

  // === PLUGINS ============================================================ //
  fastify.register(formbody)
  fastify.log.debug(
    `${logPrefix}registered plugin: formbody (for parsing application/x-www-form-urlencoded)`
  )

  if (process.env.NODE_ENV === 'development') {
    fastify.register(responseValidation)
    fastify.log.debug(`${logPrefix}registered plugin: response-validation`)
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook('onRoute', (routeOptions) => {
    fastify.log.debug(
      `${logPrefix}registered route ${routeOptions.method} ${routeOptions.url}`
    )
  })

  // === ROUTES ============================================================= //
  fastify.post(
    '/token',
    {
      schema: {
        body: Type.Union([access_token_request_body, refresh_request_body]),
        response: {
          200: access_token_response_body_success,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defTokenPost({
      accessTokenExpiration,
      ajv,
      authorizationEndpoint,
      includeErrorDescription: include_error_description,
      issuer,
      jwks,
      logPrefix,
      onIssuedTokens,
      refreshTokenExpiration,
      retrieveRefreshToken,
      revocationEndpoint,
      userinfoEndpoint
    })
  )

  fastify.setErrorHandler(
    defErrorHandler({
      includeErrorDescription: include_error_description,
      logPrefix
    })
  )

  done()
}

export default fp(tokenEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
