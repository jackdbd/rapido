import type { RequestContextData } from "@fastify/request-context";
import { InsufficientScopeError } from "@jackdbd/oauth2-error-responses";
import type { AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { preHandlerHookHandler } from "fastify";

export interface Options {
  includeErrorDescription?: boolean;
  logPrefix?: string;
  requestContextKey?: string;
  scope: string;
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: "[validate scope] ",
  requestContextKey: "access_token_claims",
};

/**
 * Validates that the request context contains a decoded access token that has
 * the expected scope.
 *
 * @see https://micropub.spec.indieweb.org/#scope
 */
export const defValidateScope = (options: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const ctx_key = config.requestContextKey as keyof RequestContextData;

  const {
    includeErrorDescription: include_error_description,
    logPrefix,
    scope,
  } = config;

  if (!ctx_key) {
    throw new Error("requestContextKey is required");
  }

  if (!scope) {
    throw new Error("scope is required");
  }

  const validateScope: preHandlerHookHandler = (request, reply, done) => {
    request.log.debug(
      `${logPrefix}get access token claims from request context key '${ctx_key}'`
    );

    const claims = request.requestContext.get(ctx_key) as AccessTokenClaims;

    if (!claims.scope) {
      const error_description = `Access token has no 'scope' claim.`;
      const err = new InsufficientScopeError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const scopes = claims.scope.split(" ");

    // The Micropub server MUST require the bearer token to include at least one
    // scope value, in order to ensure posts cannot be created by arbitrary tokens.
    // https://micropub.spec.indieweb.org/#scope-p-1
    if (scopes.length < 1) {
      const error_description = `Access token has no 'scope' claim.`;
      const err = new InsufficientScopeError({
        error_description,
        // error_uri: "https://micropub.spec.indieweb.org/#error-response",
      });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    if (!scopes.includes(scope)) {
      const error_description = `Access token 'scope' claim does not include '${scope}'.`;
      const err = new InsufficientScopeError({
        error_description,
        // error_uri: "https://micropub.spec.indieweb.org/#error-response",
      });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    return done();
  };

  return validateScope;
};
