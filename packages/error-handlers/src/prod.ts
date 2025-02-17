import {
  AccessDeniedError,
  ForbiddenError,
  InsufficientScopeError,
  InvalidClientError,
  InvalidGrantError,
  InvalidRequestError,
  InvalidScopeError,
  InvalidTokenError,
  ServerError,
  TemporaryUnavailableError,
  UnauthorizedClientError,
  UnauthorizedError,
  UnsupportedGrantTypeError,
  UnsupportedResponseTypeError
} from '@jackdbd/oauth2-error-responses'
import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from 'fastify'
import { errorDescription } from './error-description-for-validation-error.js'

type OAuth2ClientError =
  | AccessDeniedError
  | ForbiddenError
  | InsufficientScopeError
  | InvalidClientError
  | InvalidGrantError
  | InvalidRequestError
  | InvalidScopeError
  | InvalidTokenError
  | UnauthorizedClientError
  | UnauthorizedError
  | UnsupportedGrantTypeError
  | UnsupportedResponseTypeError

type OAuth2ServerError = ServerError | TemporaryUnavailableError

type OAuth2Error = OAuth2ClientError | OAuth2ServerError

// declare module '@fastify/request-context' {
//   interface RequestContextData {
//     jf2?: JF2
//   }
// }

export interface Options {
  includeErrorDescription?: boolean
  logPrefix?: string
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: ''
}

// Think about including these in the error_description:
// - some JWT claims (e.g. me, scope)
// - jf2 (e.g. action, content, h, url)
// Maybe allow the user to configure which keys to retrieve from the request
// context and/or from the session (add this in the error handler options).
const REQUEST_CONTEXT_KEYS = ['access_token_claims', 'action', 'jf2']

export const defErrorHandler = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { includeErrorDescription: include_error_description, logPrefix } =
    config

  return function errorHandler(
    this: FastifyInstance,
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // This error handler could can have catched:
    // 1. client error that has validation
    // 2. client error that has no validation
    // 3. server error that has validation
    // 4. server error that has no validation
    let err: OAuth2Error

    // All client errors and server errors should have a statusCode and a
    // message. But if they don't, we assign a default.
    const code = error.statusCode || 500
    const error_message =
      error.message || 'Unknown error (error did not set a message).'

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const req_ctx = new Map<string, any>()
    if ((request as any).requestContext) {
      REQUEST_CONTEXT_KEYS.forEach((key) => {
        const value = (request as any).requestContext.get(key)
        if (value) {
          req_ctx.set(key, value)
          request.log.debug(
            value,
            `${logPrefix}${key} extracted from requestContext`
          )
        }
      })
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (error.validation && error.validationContext) {
      // BEGIN handle client error that has validation and server error that has validation
      const { error: error_description_error, value: error_description } =
        errorDescription(error)

      if (error_description_error) {
        throw error_description_error
      }

      if (code >= 400 && code < 500) {
        const oauth2_client_error = error as OAuth2ClientError

        switch (oauth2_client_error.error) {
          case 'invalid_client': {
            err = new InvalidClientError({ error_description })
            break
          }
          case 'unsupported_grant_type': {
            err = new UnsupportedGrantTypeError({ error_description })
            break
          }
          case 'unsupported_response_type': {
            err = new UnsupportedResponseTypeError({ error_description })
            break
          }
          case 'invalid_grant': {
            err = new InvalidGrantError({ error_description })
            break
          }
          case 'invalid_token': {
            err = new InvalidTokenError({ error_description })
            break
          }
          case 'unauthorized': {
            err = new UnauthorizedError({ error_description })
            break
          }
          case 'unauthorized_client': {
            err = new UnauthorizedClientError({ error_description })
            break
          }
          case 'invalid_scope': {
            err = new InvalidScopeError({ error_description })
            break
          }
          case 'forbidden': {
            err = new ForbiddenError({ error_description })
            break
          }
          case 'access_denied': {
            err = new AccessDeniedError({ error_description })
            break
          }
          case 'insufficient_scope': {
            err = new InsufficientScopeError({ error_description })
            break
          }
          default: {
            err = new InvalidRequestError({ error_description })
          }
        }
      } else {
        const oauth2_server_error = error as OAuth2ServerError
        switch (oauth2_server_error.error) {
          case 'temporarily_unavailable': {
            err = new TemporaryUnavailableError({ error_description })
            break
          }
          default: {
            err = new ServerError({ error_description })
          }
        }
      }
      request.log.debug(
        `${logPrefix}${err.error} has error.validation and error.validationContext`
      )
      // END handle client error that has validation and server error that has validation
    } else {
      // BEGIN handle client error that has NO validation and server error that has NO validation
      if (code >= 400 && code < 500) {
        const oauth2_client_error = error as OAuth2ClientError
        if (oauth2_client_error.error) {
          err = oauth2_client_error
        } else {
          err = new InvalidRequestError({ error_description: error_message })
        }
      } else {
        const oauth2_server_error = error as OAuth2ServerError
        if (oauth2_server_error.error) {
          err = oauth2_server_error
        } else {
          err = new ServerError({ error_description: error_message })
        }
      }
      request.log.debug(
        `${logPrefix}${err.error} has no error.validation and error.validationContext`
      )
      // END handle client error that has NO validation and server error that has NO validation
    }

    request.log.error(`${logPrefix}${err.error}: ${err.error_description}`)

    // TODO: should this error handler be able to return HTML?
    // Probably yes, but then this package would depend on a view engine like
    // fastify-webc or fastify/point-of-view.
    // let send_html = false
    // if (
    //   request.headers.accept &&
    //   request.headers.accept.includes('text/html')
    // ) {
    //   send_html = true
    // }

    // if (send_html) {
    //   const data = {
    //     ...err.payload({ include_error_description }),
    //     description: err.error_description,
    //     title: `Error: ${err.error}`
    //   }
    //   return reply.code(err.statusCode).render('error.webc', data)
    // } else {
    //   return reply
    //     .code(err.statusCode)
    //     .send(err.payload({ include_error_description }))
    // }

    return reply
      .code(err.statusCode)
      .send(err.payload({ include_error_description }))
  }
}
