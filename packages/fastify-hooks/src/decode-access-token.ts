import type { RequestContextData } from "@fastify/request-context";
import { accessTokenFromRequest } from "@jackdbd/fastify-utils";
import {
  InvalidTokenError,
  UnauthorizedError,
  ServerError,
} from "@jackdbd/oauth2-error-responses";
import { safeDecode, type AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { preHandlerAsyncHookHandler } from "fastify";

declare module "@fastify/request-context" {
  interface RequestContextData {
    access_token_claims?: AccessTokenClaims;
  }
}

export interface Options {
  includeErrorDescription?: boolean;
  logPrefix?: string;
  requestContextKey?: string;
}

const defaults: Partial<Options> = {
  includeErrorDescription: false,
  logPrefix: "[decode-access-token] ",
  requestContextKey: "access_token_claims",
};

export const defDecodeAccessToken = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>;

  const ctx_key = config.requestContextKey as keyof RequestContextData;

  const { includeErrorDescription: include_error_description, logPrefix } =
    config;

  const decodeAccessToken: preHandlerAsyncHookHandler = async (
    request,
    reply
  ) => {
    const { error, value } = accessTokenFromRequest(request);

    if (error) {
      const error_description = error.message;
      const err = new UnauthorizedError({ error_description });
      request.log.warn(`${logPrefix}${error_description}`);
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    const { error: decode_error, value: claims } =
      await safeDecode<AccessTokenClaims>(value);

    if (decode_error) {
      const error_description = decode_error.message;
      const err = new InvalidTokenError({ error_description });
      request.log.warn(`${logPrefix}${error_description}`);
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    if (!request.requestContext) {
      const error_description =
        "Request-scoped storage is not available. Did you forget to register the @fastify/request-context plugin?";
      const err = new ServerError({ error_description });
      request.log.error(`${logPrefix}${error_description}`);
      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    request.log.debug(
      `${logPrefix}set access token claims in request context key '${ctx_key}'`
    );
    request.requestContext.set(ctx_key, claims);
  };

  return decodeAccessToken;
};
