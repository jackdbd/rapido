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
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

import { DEFAULT, NAME, SHORT_NAME } from './constants.js'
import { defMicropubGet } from './routes/micropub-get.js'
import { defMicropubPost } from './routes/micropub-post.js'
import {
  micropub_get_request_querystring,
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

const REQUIRED = [
  'isAccessTokenRevoked',
  'createPost',
  'me',
  'updatePost',
  'deletePost',
  'jf2ToWebsiteUrl'
] as const

const micropubEndpoint: FastifyPluginCallback<Options> = (
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
      new Ajv({
        allErrors: config.reportAllAjvErrors,
        schemas: [
          jf2.dt_accessed,
          jf2.dt_published,
          jf2.p_author,
          jf2.p_name,
          jf2.p_publication,
          jf2.u_uid,
          jf2.u_url
        ]
      }),
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
    createPost,
    deletePost,
    includeErrorDescription,
    isAccessTokenRevoked,
    jf2ToWebsiteUrl,
    logPrefix,
    me,
    mediaEndpoint,
    micropubEndpoint,
    multipartFormDataMaxFileSize,
    syndicateTo,
    undeletePost,
    updatePost
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
    {
      includeErrorDescription,
      logPrefix: `[${SHORT_NAME}/validate-claim-me] `
    }
  )

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription,
    isAccessTokenRevoked,
    logPrefix: `[${SHORT_NAME}/validate-access-token-not-revoked] `
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
    defMicropubGet({ mediaEndpoint, syndicateTo })
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
        // It's probably better to validate in the request handler, after we
        // have converted the request body to JF2. Remember that the micropub
        // endpoint could receive: MF2, MF2 JSON, JF2, urlencoded requests.
        // body: Type.Union([
        //   Type.Undefined(),
        //   mf2,
        //   parsed_mf2_json,
        //   micropub_post_request_body_jf2
        // ]),
        response: {
          // 200: micropub_response_body_success,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defMicropubPost({
      ajv,
      createPost,
      deletePost,
      isAccessTokenRevoked,
      jf2ToWebsiteUrl,
      logPrefix,
      mediaEndpoint,
      micropubEndpoint,
      undeletePost,
      updatePost
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

export default fp(micropubEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
