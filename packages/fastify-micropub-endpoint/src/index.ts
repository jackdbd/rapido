import formbody from '@fastify/formbody'
import multipart from '@fastify/multipart'
import responseValidation from '@fastify/response-validation'
import canonicalUrl from '@jackdbd/canonical-url'
import {
  defDecodeAccessToken,
  defLogClaims,
  defValidateClaim,
  defValidateNotRevoked
} from '@jackdbd/fastify-hooks'
import { error_response } from '@jackdbd/indieauth/schemas'
import { unixTimestampInSeconds } from '@jackdbd/indieauth'
import * as jf2 from '@jackdbd/microformats2'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
// import { Type } from '@sinclair/typebox'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { DEFAULT, NAME } from './constants.js'
import { defMicropubGet } from './routes/micropub-get.js'
import { defMicropubPost } from './routes/micropub-post.js'
import {
  micropub_get_request_querystring,
  // micropub_post_request_body_jf2,
  options as options_schema
} from './schemas/index.js'
import type { Options } from './schemas/index.js'

export {
  micropub_get_request_querystring,
  micropub_post_request_body_jf2,
  options as plugin_options
} from './schemas/index.js'
export type {
  MicropubGetConfig,
  Options as PluginOptions
} from './schemas/index.js'

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  multipartFormDataMaxFileSize: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
  syndicateTo: DEFAULT.SYNDICATE_TO
}

const micropubEndpoint: FastifyPluginCallback<Options> = (
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

  fastify.addSchema(jf2.dt_accessed)
  fastify.addSchema(jf2.dt_duration)
  fastify.addSchema(jf2.dt_end)
  fastify.addSchema(jf2.dt_published)
  fastify.addSchema(jf2.dt_start)
  fastify.addSchema(jf2.dt_updated)
  fastify.addSchema(jf2.e_content)
  fastify.addSchema(jf2.h_adr)
  fastify.addSchema(jf2.h_card)
  fastify.addSchema(jf2.h_cite)
  fastify.addSchema(jf2.h_entry)
  fastify.addSchema(jf2.h_event)
  fastify.addSchema(jf2.h_geo)
  fastify.addSchema(jf2.p_author)
  fastify.addSchema(jf2.p_description)
  fastify.addSchema(jf2.p_geo)
  fastify.addSchema(jf2.p_location)
  fastify.addSchema(jf2.p_publication)
  fastify.addSchema(jf2.p_rsvp)
  fastify.addSchema(jf2.p_summary)
  fastify.addSchema(jf2.u_syndication)
  fastify.addSchema(jf2.u_url)

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: 'micropub-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    create,
    delete: deleteContent,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
    me,
    mediaEndpoint,
    micropubEndpoint,
    multipartFormDataMaxFileSize,
    syndicateTo,
    undelete,
    update
  } = value.validated as Required<Options>

  // === PLUGINS ============================================================ //
  fastify.register(formbody)
  fastify.log.debug(
    `${logPrefix}registered plugin: @fastify/formbody (for parsing application/x-www-form-urlencoded)`
  )

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
    includeErrorDescription: include_error_description
  })

  const logClaims = defLogClaims({
    logPrefix: '[micropub-endpoint/log-claims] '
  })

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

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked
  })

  // === ROUTES ============================================================= //
  fastify.get(
    '/micropub',
    {
      schema: {
        querystring: micropub_get_request_querystring,
        response: {
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defMicropubGet({
      includeErrorDescription: include_error_description,
      mediaEndpoint,
      syndicateTo
    })
  )

  fastify.post(
    '/micropub',
    {
      preHandler: [
        decodeAccessToken,
        logClaims,
        validateClaimExp,
        validateClaimMe,
        validateAccessTokenNotRevoked
      ],
      schema: {
        // By default @fastify/multipart does not populate request.body. It can
        // do it by configuring attachFieldsToBody. See here:
        // https://github.com/fastify/fastify-multipart?tab=readme-ov-file#parse-all-fields-and-assign-them-to-the-body
        // It's probably better to validate in the request handler, when we know
        // whether we are dealing with a multipart request or not.
        // body: Type.Union([Type.Undefined(), micropub_post_request_body_jf2]),
        response: {
          // 200: micropub_response_body_success,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defMicropubPost({
      create,
      delete: deleteContent,
      includeErrorDescription: include_error_description,
      isAccessTokenRevoked,
      logPrefix,
      mediaEndpoint,
      micropubEndpoint,
      undelete,
      update
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

export default fp(micropubEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
