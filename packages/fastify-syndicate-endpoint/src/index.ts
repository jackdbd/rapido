import formbody from '@fastify/formbody'
import responseValidation from '@fastify/response-validation'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  defDecodeAccessToken,
  defLogClaims,
  defValidateClaim,
  defValidateNotRevoked
} from '@jackdbd/fastify-hooks'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import { error_response } from '@jackdbd/indieauth/schemas'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { DEFAULT, NAME, SHORT_NAME } from './constants.js'
import { defSyndicatePost } from './routes/syndicate-post.js'
import {
  // syndicate_post_request_body,
  options as options_schema
} from './schemas/index.js'
import type { Options } from './schemas/index.js'

export { options as plugin_options } from './schemas/index.js'
export type { Options as PluginOptions } from './schemas/index.js'

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS
}

const syndicateEndpoint: FastifyPluginCallback<Options> = (
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
      ['date', 'date-time', 'duration', 'email', 'uri']
    )
  }

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: 'syndicate-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    includeErrorDescription,
    isAccessTokenRevoked,
    logPrefix,
    me,
    retrievePost,
    syndicators,
    updatePost,
    websiteUrlToStoreLocation
  } = value.validated as Required<Options>

  // === PLUGINS ============================================================ //
  fastify.register(formbody) // TODO: do I need this?
  fastify.log.debug(
    `${logPrefix}registered plugin: formbody (for parsing application/x-www-form-urlencoded)`
  )

  if (process.env.NODE_ENV === 'development') {
    fastify.register(responseValidation)
    fastify.log.debug(
      `${logPrefix}registered plugin: @fastify/response-validation`
    )
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook('onRoute', (routeOptions) => {
    fastify.log.debug(
      `${logPrefix}registered route ${routeOptions.method} ${routeOptions.url}`
    )
  })

  const decodeAccessToken = defDecodeAccessToken({
    includeErrorDescription,
    logPrefix: `[${SHORT_NAME}/decode-access-token] `
  })

  const logClaims = defLogClaims({
    logPrefix: `[${SHORT_NAME}/log-claims] `
  })

  const validateClaimExp = defValidateClaim(
    {
      claim: 'exp',
      op: '>',
      value: unixTimestampInSeconds
    },
    {
      includeErrorDescription,
      logPrefix: `[${SHORT_NAME}/validate-claim-exp] `
    }
  )

  const validateClaimMe = defValidateClaim(
    {
      claim: 'me',
      op: '==',
      value: canonicalUrl(me)
    },
    { includeErrorDescription, logPrefix: `[${SHORT_NAME}/validate-claim-me] ` }
  )

  // const validateClaimJti = defValidateClaim({ claim: 'jti' })

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription,
    isAccessTokenRevoked,
    logPrefix: `[${SHORT_NAME}/validate-access-token-not-revoked] `
  })

  // === ROUTES ============================================================= //
  fastify.post(
    '/syndicate',
    {
      preHandler: [
        decodeAccessToken,
        logClaims,
        validateClaimExp,
        validateClaimMe,
        validateAccessTokenNotRevoked
      ],
      schema: {
        // body: syndicate_post_request_body,
        response: {
          // 200: syndicate_response_body_success,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defSyndicatePost({
      logPrefix,
      retrievePost,
      syndicators,
      updatePost,
      websiteUrlToStoreLocation
    })
  )

  fastify.setErrorHandler(
    defErrorHandler({
      includeErrorDescription,
      logPrefix: `[${SHORT_NAME}/error-handler] `
    })
  )

  done()
}

export default fp(syndicateEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
