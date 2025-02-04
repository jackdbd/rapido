import path from 'node:path'
import { fileURLToPath } from 'node:url'
import formbody from '@fastify/formbody'
import { applyToDefaults } from '@hapi/hoek'
import {
  InvalidRequestError,
  ServerError
} from '@jackdbd/oauth2-error-responses'
import responseValidation from '@fastify/response-validation'
import webc from '@jackdbd/fastify-webc'
import { code_challenge, code_challenge_method } from '@jackdbd/pkce'
import { Type } from '@sinclair/typebox'
import { Ajv, type Plugin as AjvPlugin } from 'ajv'
import addFormats from 'ajv-formats'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { error_response } from '@jackdbd/oauth2'
import { conformResult } from '@jackdbd/schema-validators'
import { DEFAULT, NAME } from './constants.js'
import { defAuthorizePage } from './routes/authorize-page.js'
import { defAuthorizePost } from './routes/authorize-post.js'
import { defHandleAction } from './routes/handle-action.js'
import {
  access_token_request_body,
  authorization_request_querystring,
  authorization_response_body_success,
  handle_action_querystring,
  options as options_schema,
  type Options,
  profile_url_request_body,
  profile_url_response_body_success
} from './schemas/index.js'

export {
  access_token_request_body,
  authorization_code_props,
  authorization_code_immutable_record,
  authorization_code_mutable_record,
  authorization_request_querystring,
  authorization_response_body_success,
  authorization_response_querystring,
  options as plugin_options,
  profile_url_request_body,
  profile_url_response_body_success
} from './schemas/index.js'
export type {
  AccessTokenRequestBody,
  AuthorizationCodeProps,
  AuthorizationCodeImmutableRecord,
  AuthorizationCodeMutableRecord,
  AuthorizationRequestQuerystring,
  AuthorizationResponseBodySuccess,
  AuthorizationResponseQuerystring,
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  Options as PluginOptions,
  ProfileUrlRequestBody,
  ProfileUrlResponseBodySuccess,
  RetrieveAuthorizationCode
} from './schemas/index.js'

declare module 'fastify' {
  interface FastifyReply {
    render(template: string, data: Record<string, any>): Promise<void>
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const defaults = {
  authorizationCodeExpiration: DEFAULT.AUTHORIZATION_CODE_EXPIRATION,
  // TODO: allow the user to pass WebC helper functions and transforms (the user
  // might have implemented WebC components that call those helpers/transforms)
  components: {
    'consent-form': path.join(
      __dirname,
      'webc',
      'components',
      'consent-form.webc'
    ),
    'scope-list': path.join(__dirname, 'webc', 'components', 'scope-list.webc'),
    'the-footer': path.join(__dirname, 'webc', 'components', 'the-footer.webc'),
    'the-header': path.join(__dirname, 'webc', 'components', 'the-header.webc')
  },
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  redirectPathOnSubmit: DEFAULT.REDIRECT_PATH_ON_SUBMIT,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
  templates: [path.join(__dirname, 'webc', 'templates')]
}

const authorizationEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = applyToDefaults(defaults, options as Partial<Options>)

  // Recommended setup for Ajv when using TypeBox
  // https://github.com/sinclairzx81/typebox?tab=readme-ov-file#ajv
  let ajv: Ajv
  if (config.ajv) {
    ajv = config.ajv as Ajv
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
    { basePath: 'authorization-endpoint-options' }
  )

  if (error) {
    return done(error)
  }

  const {
    authorizationCodeExpiration: authorization_code_expiration,
    components,
    includeErrorDescription: include_error_description,
    issuer,
    logPrefix,
    onAuthorizationCodeVerified,
    onUserApprovedRequest,
    redirectPathOnSubmit: redirect_path_on_submit,
    retrieveAuthorizationCode,
    templates
  } = value.validated as Required<Options>

  fastify.addSchema(code_challenge)
  fastify.addSchema(code_challenge_method)

  // === PLUGINS ============================================================ //
  fastify.register(formbody)
  fastify.log.debug(
    `${logPrefix}registered plugin: formbody (for parsing application/x-www-form-urlencoded)`
  )

  fastify.register(webc, { components, templates })
  fastify.log.debug(`${logPrefix}registered plugin: fastify-webc`)

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
  fastify.get(
    '/auth',
    {
      schema: {
        querystring: authorization_request_querystring,
        response: {
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defAuthorizePage({
      authorization_code_expiration,
      include_error_description,
      log_prefix: logPrefix,
      redirect_path_on_submit
    })
  )

  fastify.post(
    '/auth',
    {
      schema: {
        body: Type.Union([access_token_request_body, profile_url_request_body]),
        response: {
          200: Type.Union([
            authorization_response_body_success,
            profile_url_response_body_success
          ]),
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defAuthorizePost({
      include_error_description,
      log_prefix: logPrefix,
      onAuthorizationCodeVerified,
      retrieveAuthorizationCode
    })
  )

  fastify.get(
    redirect_path_on_submit,
    // TODO: redirect if not authenticated with ANY one of the authentication
    // providers (e.g. GitHub via RelMeAuth). For example, we need a valid
    // GitHub access token to be considered authenticated with GitHub; we do NOT
    // need a valid access token from the IndieAuth authorization server.
    // Before issuing an authorization code, the authorization server MUST first
    // verify the identity of the resource owner.
    {
      // onRequest: [redirectWhenNotAuthenticated],
      schema: {
        querystring: handle_action_querystring,
        response: {
          '4xx': error_response,
          '5xx': error_response
        }
      }
    },
    defHandleAction({
      authorization_code_expiration,
      include_error_description,
      issuer,
      log_prefix: logPrefix,
      onUserApprovedRequest
    })
  )

  fastify.setErrorHandler((error, request, reply) => {
    const code = error.statusCode

    // Think about including these data error_description:
    // - some JWT claims (e.g. me, scope)
    // - jf2 (e.g. action, content, h, url)
    // const claims = request.requestContext.get("access_token_claims");
    // const jf2 = request.requestContext.get("jf2");
    // console.log("=== claims ===", claims);
    // console.log("=== jf2 ===", jf2);

    if (code && code >= 400 && code < 500) {
      request.log.warn(
        `${logPrefix}client error catched by error handler: ${error.message}`
      )
    } else {
      request.log.error(
        `${logPrefix}server error catched by error handler: ${error.message}`
      )
    }

    if (error.validation && error.validationContext) {
      if (code && code >= 400 && code < 500) {
        const messages = error.validation.map((ve) => {
          return `${error.validationContext}${ve.instancePath} ${ve.message}`
        })
        const error_description = messages.join('; ')
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    }

    // If it's not a client error, is it always a generic Internal Server Error?
    // Probably we can return a HTTP 503 Service Unavailable (maybe use
    // @fastify/under-pressure).
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses

    const error_description = error.message
    const err = new ServerError({ error_description })
    return reply
      .code(err.statusCode)
      .send(err.payload({ include_error_description }))
  })

  done()
}

export default fp(authorizationEndpoint, {
  fastify: '5.x',
  name: NAME,
  encapsulate: true
})
