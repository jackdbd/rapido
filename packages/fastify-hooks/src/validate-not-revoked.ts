import {
  InvalidTokenError,
  UnauthorizedError,
} from "@jackdbd/oauth2-error-responses";
import type { AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { RequestContextData } from "@fastify/request-context";
import type { preHandlerAsyncHookHandler } from "fastify";
import type { IsAccessTokenRevoked } from "./schemas/index.js";

export interface Options {
  includeErrorDescription?: boolean;
  isAccessTokenRevoked: IsAccessTokenRevoked;
  logPrefix?: string;
  requestContextKey?: string;
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: "[validate not-revoked] ",
  requestContextKey: "access_token_claims",
};

export const defValidateNotRevoked = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const ctx_key = config.requestContextKey as keyof RequestContextData;

  const {
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
  } = config;

  if (!ctx_key) {
    throw new Error("requestContextKey is required");
  }

  if (!isAccessTokenRevoked) {
    throw new Error("isAccessTokenRevoked is required");
  }

  const validateNotRevoked: preHandlerAsyncHookHandler = async (
    request,
    reply
  ) => {
    request.log.debug(
      `${logPrefix}get access token claims from request context key '${ctx_key}'`
    );

    const claims = request.requestContext.get(ctx_key) as AccessTokenClaims;

    if (!claims) {
      const error_description = `No access token claims in request context, under key '${ctx_key}'`;
      const err = new UnauthorizedError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const { jti } = claims;

    request.log.debug(`${logPrefix}invoke user-provided isAccessTokenRevoked`);
    // The isAccessTokenRevoked function is provided by the user and might throw
    // an exception. We can either try/catch it here, or let it bubble up and
    // catch it in the error handler set by this plugin with
    // fastify.setErrorHandler. I don't think catching the exception here adds
    // much value. It seems better to just handle it in ther error handler.
    const revoked = await isAccessTokenRevoked(jti);
    // request.log.debug(`${logPrefix}user-provided isAccessTokenRevoked returned ${revoked}`);

    if (revoked) {
      const error_description = `access token jti=${jti} is revoked`;
      const err = new InvalidTokenError({ error_description });
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }
  };

  return validateNotRevoked;
};
