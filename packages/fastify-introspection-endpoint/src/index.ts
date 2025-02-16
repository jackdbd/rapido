import formbody from '@fastify/formbody'
import responseValidation from '@fastify/response-validation'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  defDecodeAccessToken,
  defValidateClaim,
  defValidateNotRevoked
} from '@jackdbd/fastify-hooks'
import { error_response, unixTimestampInSeconds } from '@jackdbd/indieauth'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { DEFAULT, NAME } from './constants.js'
import { defIntrospectPost } from './routes/introspect-post.js'
import {
  introspection_request_body,
  introspection_response_body_when_token_is_retrieved,
  introspection_response_body_when_token_is_not_retrieved,
  options as options_schema
} from './schemas/index.js'
import type { Options } from './schemas/index.js'
import { Type } from '@sinclair/typebox'

export {
  introspection_request_body,
  introspection_response_body_when_token_is_retrieved,
  introspection_response_body_when_token_is_not_retrieved,
  options as plugin_options
} from './schemas/index.js'
export type {
  IntrospectPostConfig,
  IntrospectionRequestBody,
  IntrospectionResponseBodyWhenTokenIsRetrieved,
  IntrospectionResponseBodyWhenTokenIsNotRetrieved,
  Options as PluginOptions
} from './schemas/index.js'

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS
}

const REQUIRED = [
  'isAccessTokenRevoked',
  'isRefreshTokenRevoked',
  'retrieveAccessToken',
  'retrieveRefreshToken'
] as const

const introspectionEndpoint: FastifyPluginCallback<Options> = (
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
      ['uri']
    )
  }

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: 'introspection-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    isRefreshTokenRevoked,
    issuer,
    jwksUrl: jwks_url,
    logPrefix,
    me,
    retrieveAccessToken,
    retrieveRefreshToken
  } = value.validated as Required<Options>

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

  const decodeAccessToken = defDecodeAccessToken({
    includeErrorDescription: include_error_description,
    logPrefix: `[introspection-endpoint/decode-access-token] `
  })

  const validateClaimExp = defValidateClaim(
    {
      claim: 'exp',
      op: '>',
      value: unixTimestampInSeconds
    },
    {
      includeErrorDescription: include_error_description,
      logPrefix: `[introspection-endpoint/validate-claim-exp] `
    }
  )

  const validateClaimMe = defValidateClaim(
    {
      claim: 'me',
      op: '==',
      value: canonicalUrl(me)
    },
    {
      includeErrorDescription: include_error_description,
      logPrefix: `[introspection-endpoint/validate-claim-me] `
    }
  )

  // TODO: re-read RFC7662 and decide which scope to check
  // https://www.rfc-editor.org/rfc/rfc7662
  // const validateScopeIntrospect = defValidateScope({ scope: 'introspect' })

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix: `[introspection-endpoint/validate-not-revoked] `
  })

  // === ROUTES ============================================================= //
  fastify.post(
    '/introspect',
    {
      preHandler: [
        decodeAccessToken,
        validateClaimExp,
        validateClaimMe,
        // validateClaimJti,
        validateAccessTokenNotRevoked
      ],
      schema: {
        body: introspection_request_body,
        response: {
          200: Type.Union([
            introspection_response_body_when_token_is_retrieved,
            introspection_response_body_when_token_is_not_retrieved
          ]),
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defIntrospectPost({
      ajv,
      includeErrorDescription: include_error_description,
      isAccessTokenRevoked,
      isRefreshTokenRevoked,
      issuer,
      jwks_url,
      logPrefix,
      //  max_token_age,
      retrieveAccessToken,
      retrieveRefreshToken
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

/**
 * Plugin that adds a token introspection endpoint to a Fastify server.
 *
 * @see [RFC7662 OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662)
 */
export default fp(introspectionEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
