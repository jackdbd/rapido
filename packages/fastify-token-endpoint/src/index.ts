import formbody from '@fastify/formbody'
import responseValidation from '@fastify/response-validation'
import { error_response } from '@jackdbd/oauth2'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Type } from '@sinclair/typebox'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

// import { defRedirectWhenNotAuthenticated } from '../../lib/fastify-hooks/index.js'
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
  access_token_props,
  access_token_immutable_record,
  access_token_mutable_record,
  access_token_request_body,
  access_token_response_body_success,
  isAccessTokenRevoked,
  onIssuedTokens,
  options as plugin_options,
  refresh_token_props,
  refresh_token_immutable_record,
  refresh_token_mutable_record,
  refresh_request_body,
  retrieveRefreshToken
} from './schemas/index.js'
export type {
  AccessTokenProps,
  AccessTokenImmutableRecord,
  AccessTokenMutableRecord,
  AccessTokenRequestBody,
  AccessTokenResponseBodySuccess,
  IsAccessTokenRevoked,
  OnIssuedTokens,
  Options as PluginOptions,
  RefreshRequestBody,
  RefreshTokenProps,
  RefreshTokenImmutableRecord,
  RefreshTokenMutableRecord,
  RetrieveRefreshToken
} from './schemas/index.js'

const defaults = {
  accessTokenExpiration: DEFAULT.ACCESS_TOKEN_EXPIRATION,
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  refreshTokenExpiration: DEFAULT.REFRESH_TOKEN_EXPIRATION,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS
}

/**
 * Adds an IndieAuth Token Endpoint to a Fastify server.
 */
const tokenEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign({}, defaults, options)

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
      preHandler: function (_request, _reply, done) {
        // const { grant_type } = request.body
        // console.log('=== preHandler request.body ===', request.body)
        // Require authentication for refresh token requests.
        // https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1
        // if (grant_type === 'refresh_token') {
        // request.log.warn(
        //   `${logPrefix}require authentication for refresh token requests`
        // )
        // TODO: do NOT redirect here. This is an API endpoint! A redirect
        // might be ok for browser clients, but not for API clients (e.g. Bruno).
        // }
        done()
      },
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
