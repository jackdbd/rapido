import {
  InvalidRequestError,
  ServerError
} from '@jackdbd/oauth2-error-responses'
import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from 'fastify'

export interface Options {
  includeErrorDescription?: boolean
  logPrefix?: string
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: ''
}

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
  }
}
