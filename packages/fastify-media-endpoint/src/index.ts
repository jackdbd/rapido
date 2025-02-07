import multipart from '@fastify/multipart'
import responseValidation from '@fastify/response-validation'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  defDecodeAccessToken,
  defLogClaims,
  defValidateClaim,
  defValidateNotRevoked,
  defValidateScope
} from '@jackdbd/fastify-hooks'
import { error_response } from '@jackdbd/indieauth/schemas'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { DEFAULT, NAME } from './constants.js'
import { defMediaPost } from './routes/media-post.js'
import { options as options_schema, type Options } from './schemas/index.js'

export { options as plugin_options } from './schemas/index.js'
export type { Options as PluginOptions } from './schemas/index.js'

const defaults: Partial<Options> = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  multipartFormDataMaxFileSize: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS
}

const mediaEndpoint: FastifyPluginCallback<Options> = (
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
      ['uri']
    )
  }

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: 'media-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    delete: deleteMedia,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
    me,
    multipartFormDataMaxFileSize,
    upload
  } = value.validated as Required<Options>

  // === PLUGINS ============================================================ //
  fastify.register(multipart, {
    limits: {
      fileSize: multipartFormDataMaxFileSize
    }
  })
  fastify.log.debug(
    `${logPrefix}registered plugin: @fastify/multipart (for parsing multipart/form-data)`
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
    includeErrorDescription: include_error_description
  })

  const logClaims = defLogClaims({ logPrefix: '[media-endpoint/log-claims] ' })

  const validateClaimExp = defValidateClaim(
    {
      claim: 'exp',
      op: '>',
      value: unixTimestampInSeconds
    },
    { includeErrorDescription: include_error_description }
  )

  const validateClaimMe = defValidateClaim(
    {
      claim: 'me',
      op: '==',
      value: canonicalUrl(me)
    },
    { includeErrorDescription: include_error_description }
  )

  const validateScopeMedia = defValidateScope({ scope: 'media' })

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked
  })

  // === ROUTES ============================================================= //
  fastify.post(
    '/media',
    {
      preHandler: [
        decodeAccessToken,
        logClaims,
        validateClaimExp,
        validateClaimMe,
        validateScopeMedia,
        validateAccessTokenNotRevoked
      ],
      schema: {
        // body: media_post_request_body,
        response: {
          // 200: media_response_body_success,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defMediaPost({
      delete: deleteMedia,
      include_error_description,
      upload
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

export default fp(mediaEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
