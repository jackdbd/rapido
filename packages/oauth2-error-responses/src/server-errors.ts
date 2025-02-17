import { BaseError, type ErrorData } from './base.js'

/**
 * The authorization server encountered an unexpected condition that prevented
 * it from fulfilling the request.
 *
 * This error code is needed because a 500 Internal Server Error HTTP status
 * code cannot be returned to the client via an HTTP redirect.
 */
export class ServerError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_SERVER_ERROR', 'server_error', 500, 'Server Error', data)
  }
}

/**
 * The authorization server is currently unable to handle the request due to a
 * temporary overloading or maintenance of the server.
 *
 * This error code is needed because a 503 Service Unavailable HTTP status code
 * cannot be returned to the client via an HTTP redirect.
 */
export class TemporaryUnavailableError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_TEMPORARILY_UNAVAILABLE',
      'temporarily_unavailable',
      503,
      'Temporarily Unavailable',
      data
    )
  }
}

export type OAuth2ServerError = ServerError | TemporaryUnavailableError
