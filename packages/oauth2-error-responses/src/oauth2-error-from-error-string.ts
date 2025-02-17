import {
  AccessDeniedError,
  ForbiddenError,
  InsufficientScopeError,
  InvalidClientError,
  InvalidGrantError,
  InvalidRequestError,
  InvalidScopeError,
  InvalidTokenError,
  UnauthorizedClientError,
  UnauthorizedError,
  UnsupportedGrantTypeError,
  UnsupportedResponseTypeError
} from './client-errors.js'
import { ServerError, TemporaryUnavailableError } from './server-errors.js'

interface Options {
  error_description?: string
  error_uri?: string
  state?: string
}

const defaults = {
  error_uri: undefined,
  state: undefined
}

export const oauth2ErrorFromErrorString = (
  error: string,
  options?: Options
) => {
  const config = Object.assign({}, defaults, options)
  const { error_uri, state } = config

  const error_description =
    config.error_description || 'Error has no error_description property.'

  const data = { error_description, error_uri, state }

  switch (error) {
    case 'invalid_client': {
      return new InvalidClientError(data)
    }
    case 'unsupported_grant_type': {
      return new UnsupportedGrantTypeError(data)
    }
    case 'unsupported_response_type': {
      return new UnsupportedResponseTypeError(data)
    }
    case 'invalid_grant': {
      return new InvalidGrantError(data)
    }
    case 'invalid_token': {
      return new InvalidTokenError(data)
    }
    case 'unauthorized': {
      return new UnauthorizedError(data)
    }
    case 'unauthorized_client': {
      return new UnauthorizedClientError(data)
    }
    case 'invalid_request': {
      return new InvalidRequestError(data)
    }
    case 'invalid_scope': {
      return new InvalidScopeError(data)
    }
    case 'forbidden': {
      return new ForbiddenError(data)
    }
    case 'access_denied': {
      return new AccessDeniedError(data)
    }
    case 'insufficient_scope': {
      return new InsufficientScopeError(data)
    }
    case 'server_error': {
      return new ServerError(data)
    }
    case 'temporarily_unavailable': {
      return new TemporaryUnavailableError(data)
    }
    default: {
      throw new Error(`Unknown OAuth2 error string: ${error}`)
    }
  }
}
