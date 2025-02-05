import responseValidation from '@fastify/response-validation'
import {
  defDecodeAccessToken,
  defValidateClaim,
  defValidateNotRevoked,
  defValidateScope
} from '@jackdbd/fastify-hooks'
import { profile } from '@jackdbd/indieauth'
import { error_response } from '@jackdbd/oauth2'
import { unixTimestampInSeconds } from '@jackdbd/oauth2-tokens'
import { conformResult } from '@jackdbd/schema-validators'
import { defErrorHandler } from '@repo/error-handlers'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { DEFAULT, NAME } from './constants.js'
import { defUserinfoGet } from './routes/userinfo-get.js'
import { options as options_schema, type Options } from './schemas/index.js'

export {
  isAccessTokenRevoked,
  options as plugin_options,
  retrieveUserProfile,
  userinfo_get_config,
  user_profile_props,
  user_profile_immutable_record,
  user_profile_mutable_record
} from './schemas/index.js'
export type {
  IsAccessTokenRevoked,
  Options as PluginOptions,
  RetrieveUserProfile,
  UserinfoGetConfig,
  UserProfileProps,
  UserProfileImmutableRecord,
  UserProfileMutableRecord
} from './schemas/index.js'

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
  requestContextKey: DEFAULT.REQUEST_CONTEXT_KEY
}

const userinfoEndpoint: FastifyPluginCallback<Options> = (
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
    { basePath: 'userinfo-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
    requestContextKey,
    retrieveUserProfile
  } = value.validated as Required<Options>

  // === PLUGINS ============================================================ //
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

  const validateClaimExp = defValidateClaim(
    {
      claim: 'exp',
      op: '>',
      value: unixTimestampInSeconds
    },
    { includeErrorDescription: include_error_description }
  )

  const validateScopeProfile = defValidateScope({
    scope: 'profile',
    includeErrorDescription: include_error_description
  })

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked
  })

  // === ROUTES ============================================================= //
  // To fetch the user's profile information, the client makes a GET request to
  // the userinfo endpoint, providing an access token that was issued with the
  // `profile` and/or `email` scopes.
  // https://indieauth.spec.indieweb.org/#user-information
  // https://indieauth.spec.indieweb.org/#profile-information
  fastify.get(
    '/userinfo',
    {
      preHandler: [
        decodeAccessToken,
        validateClaimExp,
        // validateClaimJti,
        validateScopeProfile,
        validateAccessTokenNotRevoked
      ],
      schema: {
        // it seems, by reading the IndieAuth spec, that a GET request to the
        // userinfo endpoint has no querystring.
        // https://indieauth.spec.indieweb.org/#user-information
        // querystring: Type.Object({}),
        response: {
          200: profile,
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defUserinfoGet({
      ajv,
      includeErrorDescription: include_error_description,
      logPrefix,
      requestContextKey,
      retrieveUserProfile
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

export default fp(userinfoEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
