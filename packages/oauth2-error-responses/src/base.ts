import { FastifyError } from '@fastify/error'

export interface ErrorData {
  error_description: string
  error_uri?: string
  state?: string
}

export interface PayloadOptions {
  include_error_description?: boolean
}

export type PayloadFunction = (options?: PayloadOptions) => {
  error: string
  error_description?: string
  error_uri?: string
  state?: string
}

export interface ErrorResponseFromJSON {
  statusCode: number
  payload: PayloadFunction
}

/**
 * Base class for creating an error response that has all the properties
 * required by these protocols:
 *
 * - [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749#section-4.2.2.1)
 * - [IndieAuth](https://indieauth.spec.indieweb.org/#error-responses)
 * - [Micropub](https://micropub.spec.indieweb.org/#error-response)
 *
 * @see [Error Response - The OAuth 2.0 Authorization Framework (RFC 6749)]()
 */
export class BaseError extends Error implements FastifyError {
  public readonly code: string
  public readonly statusCode: number
  public readonly error: string
  public readonly error_description?: string
  public readonly error_uri?: string
  public readonly state?: string

  constructor(
    code: string,
    error: string,
    statusCode: number,
    name: string,
    data: ErrorData
  ) {
    const message = `${error}: ${data.error_description}`
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.error = error
    this.error_description = data.error_description
    this.error_uri = data.error_uri
    this.state = data.state
    this.name = name
  }

  public payload(options?: PayloadOptions) {
    const opt = options || {}
    const include_error_description = opt.include_error_description ?? false

    return include_error_description
      ? {
          error: this.error,
          error_description: this.error_description,
          error_uri: this.error_uri,
          state: this.state
        }
      : { error: this.error }
  }
}
