import { BaseError, type ErrorData } from './base.js'

/**
 * The request is missing a required parameter, includes an invalid parameter
 * value, includes a parameter more than once, or is otherwise malformed.
 */
export class InvalidRequestError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_INVALID_REQUEST',
      'invalid_request',
      400,
      'Invalid Request',
      data
    )
  }
}

/**
 * Client authentication failed (e.g., unknown client, no client authentication
 * included, or unsupported authentication method).
 */
export class InvalidClientError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_INVALID_CLIENT',
      'invalid_client',
      401,
      'Invalid Client',
      data
    )
  }
}

/**
 * The authorization grant type is not supported by the authorization server.
 */
export class UnsupportedGrantTypeError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_UNSUPPORTED_GRANT_TYPE',
      'unsupported_grant_type',
      400,
      'Unsupported Grant Type',
      data
    )
  }
}

/**
 * The authorization server does not support obtaining either an **authorization
 * code** or an **access token** using this method.
 */
export class UnsupportedResponseTypeError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_UNSUPPORTED_RESPONSE_TYPE',
      'unsupported_response_type',
      400,
      'Unsupported Response Type',
      data
    )
  }
}

/**
 * The provided authorization grant (e.g., authorization code, resource owner
 * credentials) or refresh token is invalid, expired, revoked, does not match
 * the redirection URI used in the authorization request, or was issued to
 * another client.
 */
export class InvalidGrantError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_INVALID_GRANT', 'invalid_grant', 400, 'Invalid Grant', data)
  }
}

/**
 * The **access token** provided is expired, revoked, or invalid.
 *
 * Do **not** use this error for **refresh tokens**. When a refresh token is
 * expired, revoked, or invalid, user `InvalidGrantError` instead.
 *
 * This is defined by IndieAuth, not OAuth 2.0.
 *
 * @see [Error Responses - IndieAuth](https://indieauth.spec.indieweb.org/#error-responses)
 */
export class InvalidTokenError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_INVALID_TOKEN', 'invalid_token', 401, 'Invalid Token', data)
  }
}

/**
 * No access token was provided in the request.
 *
 * Note that this is different from the HTTP 403 response, as the 403 response
 * should only be used when an access token is provided and the user does not
 * have permission to perform the request.
 */
export class UnauthorizedError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_UNAUTHORIZED', 'unauthorized', 401, 'Unauthorized', data)
  }
}

/**
 * The client is not authorized to request an authorization code using this
 * method.
 */
export class UnauthorizedClientError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_UNAUTHORIZED_CLIENT',
      'unauthorized_client',
      401,
      'Unauthorized Client',
      data
    )
  }
}

/**
 * The requested scope is invalid, unknown, or malformed.
 */
export class InvalidScopeError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_INVALID_SCOPE', 'invalid_scope', 401, 'Invalid Scope', data)
  }
}

/**
 * The **authenticated** user does not have permission to perform this request.
 */
export class ForbiddenError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_FORBIDDEN', 'forbidden', 403, 'Forbidden', data)
  }
}

/**
 * The resource owner or authorization server denied the request.
 */
export class AccessDeniedError extends BaseError {
  constructor(data: ErrorData) {
    super('FST_ERR_ACCESS_DENIED', 'access_denied', 403, 'Access Denied', data)
  }
}

/**
 * The request requires higher privileges than provided.
 */
export class InsufficientScopeError extends BaseError {
  constructor(data: ErrorData) {
    super(
      'FST_ERR_INSUFFICIENT_SCOPE',
      'insufficient_scope',
      403,
      'Insufficient Scope',
      data
    )
  }
}

export type OAuth2ClientError =
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
