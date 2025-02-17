import type { OAuth2ClientError } from './client-errors.js'
import type { OAuth2ServerError } from './server-errors.js'

export { BaseError } from './base.js'
export type {
  ErrorData,
  ErrorResponseFromJSON,
  PayloadFunction,
  PayloadOptions
} from './base.js'

export {
  InsufficientScopeError,
  InvalidRequestError,
  ForbiddenError,
  AccessDeniedError,
  InvalidGrantError,
  InvalidScopeError,
  InvalidTokenError,
  UnauthorizedError,
  InvalidClientError,
  UnauthorizedClientError,
  UnsupportedGrantTypeError,
  UnsupportedResponseTypeError
} from './client-errors.js'

export { oauth2ErrorFromErrorString } from './oauth2-error-from-error-string.js'

export { ServerError, TemporaryUnavailableError } from './server-errors.js'

export type { OAuth2ClientError } from './client-errors.js'
export type { OAuth2ServerError } from './server-errors.js'
export type OAuth2Error = OAuth2ClientError | OAuth2ServerError
