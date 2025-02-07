import type { ErrorResponse } from './schemas/error.js'

export interface ErrorResponseBody extends ErrorResponse {
  code?: string
  message?: string
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

export const errorResponseFromJSONResponse = async (
  response: Response
): Promise<ErrorResponseFromJSON> => {
  const body: ErrorResponseBody = await response.json()

  return {
    statusCode: response.status,
    payload: (options) => {
      const opt = options || {}
      const include_error_description = opt.include_error_description ?? false

      const default_error =
        response.status >= 500 ? 'server_error' : 'invalid_request'

      const default_error_description = response.statusText

      return include_error_description
        ? {
            error: body.error || body.message || default_error,
            error_description:
              body.error_description || default_error_description,
            error_uri: body.error_uri,
            state: body.state
          }
        : { error: body.error }
    }
  }
}
