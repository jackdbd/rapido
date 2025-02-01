import { InsufficientScopeError } from "@jackdbd/oauth2-error-responses";
import type { AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { RequestContextData } from "@fastify/request-context";
import type { preHandlerHookHandler } from "fastify";
// import type { onRequestHookHandler } from "fastify";

export interface Options {
  logPrefix?: string;
  requestContextKey?: string;
  scope: string;
}

const defaults: Partial<Options> = {
  logPrefix: "[validate scope] ",
  requestContextKey: "access_token_claims",
};

/**
 * Validates that the request context contains a decoded access token that has
 * the expected scope.
 *
 * @see https://micropub.spec.indieweb.org/#scope
 */
export const defValidateScope = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const ctx_key = config.requestContextKey as keyof RequestContextData;

  const { logPrefix, scope } = config;

  if (!ctx_key) {
    throw new Error("requestContextKey is required");
  }

  const validateScope: preHandlerHookHandler = (request, _reply, done) => {
    request.log.debug(
      `${logPrefix}get access token claims from request context key '${ctx_key}'`
    );

    const claims = request.requestContext.get(ctx_key) as AccessTokenClaims;

    // If this hook has no scope to check, then it's basically a NOP.
    if (!scope) {
      return done();
    }

    const scopes = claims.scope.split(" ");

    // The Micropub server MUST require the bearer token to include at least one
    // scope value, in order to ensure posts cannot be created by arbitrary tokens.
    // https://micropub.spec.indieweb.org/#scope-p-1
    if (scopes.length < 1) {
      const error_description = `Claims found in session do not include a 'scope' claim.`;
      return new InsufficientScopeError({
        error_description,
        // error_uri: "https://micropub.spec.indieweb.org/#error-response",
      });
    }

    if (!scopes.includes(scope)) {
      const error_description = `Claim 'scope' found in session does not include '${scope}'.`;
      return new InsufficientScopeError({
        error_description,
        // error_uri: "https://micropub.spec.indieweb.org/#error-response",
      });
    }

    return done();
  };

  return validateScope;
};
