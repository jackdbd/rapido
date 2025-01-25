import formbody from "@fastify/formbody";
import responseValidation from "@fastify/response-validation";
import { Type } from "@sinclair/typebox";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
// import { defRedirectWhenNotAuthenticated } from '../../lib/fastify-hooks/index.js'
import { error_response } from "@jackdbd/oauth2";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { defTokenPost } from "./routes/token-post.js";
import { DEFAULT, NAME } from "./constants.js";
import {
  access_token_request_body,
  access_token_response_body_success,
  options as options_schema,
  refresh_request_body,
  type Options,
} from "./schemas/index.js";

export {
  access_token_props,
  access_token_immutable_record,
  access_token_mutable_record,
  access_token_request_body,
  access_token_response_body_success,
  isAccessTokenRevoked,
  onIssuedTokens,
  options as plugin_options,
  refresh_token_props,
  refresh_token_immutable_record,
  refresh_token_mutable_record,
  refresh_request_body,
  retrieveRefreshToken,
} from "./schemas/index.js";
export type {
  AccessTokenProps,
  AccessTokenImmutableRecord,
  AccessTokenMutableRecord,
  AccessTokenRequestBody,
  AccessTokenResponseBodySuccess,
  IsAccessTokenRevoked,
  OnIssuedTokens,
  Options as PluginOptions,
  RefreshRequestBody,
  RefreshTokenProps,
  RefreshTokenImmutableRecord,
  RefreshTokenMutableRecord,
  RetrieveRefreshToken,
} from "./schemas/index.js";

const defaults = {
  accessTokenExpiration: DEFAULT.ACCESS_TOKEN_EXPIRATION,
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  refreshTokenExpiration: DEFAULT.REFRESH_TOKEN_EXPIRATION,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
};

/**
 * Adds an IndieAuth Token Endpoint to a Fastify server.
 */
const tokenEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign(defaults, options);

  const {
    accessTokenExpiration,
    authorizationEndpoint,
    includeErrorDescription,
    // isAccessTokenRevoked,
    issuer,
    jwks,
    logPrefix: log_prefix,
    onIssuedTokens,
    refreshTokenExpiration,
    reportAllAjvErrors,
    retrieveRefreshToken,
    revocationEndpoint,
    userinfoEndpoint,
  } = config;

  let ajv: Ajv;
  if (config.ajv) {
    ajv = config.ajv;
  } else {
    // I have no idea why I have to do this to make TypeScript happy.
    // In JavaScript, Ajv and addFormats can be imported without any of this mess.
    const addFormatsPlugin = addFormats as any as AjvPlugin<string[]>;
    ajv = addFormatsPlugin(new Ajv({ allErrors: reportAllAjvErrors }), [
      "email",
      "uri",
    ]);
  }

  throwWhenNotConform(
    { ajv, schema: options_schema, data: config },
    { basePath: "token-endpoint-options" }
  );

  fastify.log.debug(
    `${log_prefix}access token expiration: ${accessTokenExpiration}`
  );
  fastify.log.debug(
    `${log_prefix}refresh token expiration: ${refreshTokenExpiration}`
  );

  // === PLUGINS ============================================================ //
  // Parse application/x-www-form-urlencoded requests
  fastify.register(formbody);
  fastify.log.debug(`${log_prefix}registered plugin: formbody`);

  if (process.env.NODE_ENV === "development") {
    fastify.register(responseValidation);
    fastify.log.debug(`${log_prefix}registered plugin: response-validation`);
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook("onRoute", (routeOptions) => {
    fastify.log.debug(
      `${log_prefix}registered route ${routeOptions.method} ${routeOptions.url}`
    );
  });

  // === ROUTES ============================================================= //
  fastify.post(
    "/token",
    {
      preHandler: function (_request, _reply, done) {
        // const { grant_type } = request.body
        // console.log('=== preHandler request.body ===', request.body)
        // Require authentication for refresh token requests.
        // https://datatracker.ietf.org/doc/html/rfc6749#section-3.2.1
        // if (grant_type === 'refresh_token') {
        // request.log.warn(
        //   `${log_prefix}require authentication for refresh token requests`
        // )
        // TODO: do NOT redirect here. This is an API endpoint! A redirect
        // might be ok for browser clients, but not for API clients (e.g. Bruno).
        // }
        done();
      },
      schema: {
        body: Type.Union([access_token_request_body, refresh_request_body]),
        response: {
          200: access_token_response_body_success,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defTokenPost({
      accessTokenExpiration,
      ajv,
      authorizationEndpoint,
      includeErrorDescription,
      issuer,
      jwks,
      logPrefix: log_prefix,
      onIssuedTokens,
      refreshTokenExpiration,
      retrieveRefreshToken,
      revocationEndpoint,
      userinfoEndpoint,
    })
  );

  done();
};

export default fp(tokenEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
