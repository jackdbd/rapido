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

type OAuth2Error =
  | AccessDeniedError
  | ForbiddenError
  | InsufficientScopeError
  | InvalidClientError
  | InvalidGrantError
  | InvalidRequestError
  | InvalidScopeError
  | InvalidTokenError
  | ServerError
  | TemporaryUnavailableError
  | UnauthorizedClientError
  | UnauthorizedError
  | UnsupportedGrantTypeError
  | UnsupportedResponseTypeError

export interface Options {
  includeErrorDescription?: boolean
  logPrefix?: string
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: ''
}

interface MessageMap {
  [message: string]: { allowed_values: string[] }
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

    // Think about including these in the error_description:
    // - some JWT claims (e.g. me, scope)
    // - jf2 (e.g. action, content, h, url)
    // Maybe allow the user to configure which keys to retrieve from the request
    // context (add this in the error handler options).

    // const claims = (request as any).requestContext.get('access_token_claims')
    // const jf2 = request.requestContext.get("jf2");
    // console.log('=== claims ===', claims)
    // console.log('=== jf2 ===', jf2)

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
      const message_map: MessageMap = {}
      if (code && code >= 400 && code < 500) {
        error.validation.forEach((ve) => {
          const msg = `${error.validationContext}${ve.instancePath} ${ve.message}`

          const allowed_values: any = []
          for (const [k, val] of Object.entries(ve.params)) {
            if (k === 'allowedValue') {
              allowed_values.push(val)
            }
          }

          if (message_map[msg]) {
            message_map[msg].allowed_values.push(...allowed_values)
          } else {
            message_map[msg] = { allowed_values }
          }
        })

        const messages = Object.entries(message_map)
          .filter(([msg]) => {
            return !msg.includes('must match a schema in anyOf')
          })
          .map(([msg, { allowed_values }]) => {
            if (allowed_values.length > 0) {
              return `${msg} (allowed values: ${allowed_values.join(', ')})`
            } else {
              return msg
            }
          })

        let err: InvalidRequestError
        const error_description = messages.join('; ')

        const oauth2_error = error as InvalidRequestError
        if (oauth2_error.error) {
          err = new InvalidRequestError({
            error_description:
              oauth2_error.error_description || error_description,
            error_uri: oauth2_error.error_uri,
            state: oauth2_error.state
          })
        } else {
          err = new InvalidRequestError({ error_description })
        }

        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    }

    let err: OAuth2Error
    const oauth2_error = error as OAuth2Error
    if (oauth2_error.error) {
      err = oauth2_error
    } else {
      err = new ServerError({ error_description: error.message })
    }

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
