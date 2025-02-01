import formbody from "@fastify/formbody";
import responseValidation from "@fastify/response-validation";
import canonicalUrl from "@jackdbd/canonical-url";
import {
  decodeAccessToken,
  defValidateClaim,
  defValidateNotRevoked,
} from "@jackdbd/fastify-hooks";
import { error_response } from "@jackdbd/oauth2";
import { unixTimestampInSeconds } from "@jackdbd/oauth2-tokens";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

import { DEFAULT, NAME } from "./constants.js";
import { defIntrospectPost } from "./routes/introspect-post.js";
import {
  introspection_request_body,
  introspection_response_body_success,
  options as options_schema,
} from "./schemas/index.js";
import type { Options } from "./schemas/index.js";

export {
  introspection_request_body,
  introspection_response_body_success,
  isAccessTokenRevoked,
  options as plugin_options,
} from "./schemas/index.js";
export type {
  IntrospectPostConfig,
  IntrospectionRequestBody,
  IntrospectionResponseBodySuccess,
  IsAccessTokenRevoked,
  Options as PluginOptions,
} from "./schemas/index.js";

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
};

const introspectionEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign({}, defaults, options);

  const {
    includeErrorDescription,
    logPrefix: log_prefix,
    me,
    reportAllAjvErrors,
  } = config;

  let ajv: Ajv;
  if (config.ajv) {
    ajv = config.ajv;
  } else {
    // I have no idea why I have to do this to make TypeScript happy.
    // In JavaScript, Ajv and addFormats can be imported without any of this mess.
    const addFormatsPlugin = addFormats as any as AjvPlugin<string[]>;
    ajv = addFormatsPlugin(new Ajv({ allErrors: reportAllAjvErrors }), ["uri"]);
  }

  throwWhenNotConform(
    { ajv, schema: options_schema, data: config },
    { basePath: "introspection-endpoint-options" }
  );

  const { isAccessTokenRevoked, issuer, jwksUrl: jwks_url } = config;

  // === PLUGINS ============================================================ //
  fastify.register(formbody);
  fastify.log.debug(
    `${log_prefix}registered plugin: formbody (for parsing application/x-www-form-urlencoded)`
  );

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

  const validateClaimExp = defValidateClaim(
    {
      claim: "exp",
      op: ">",
      value: unixTimestampInSeconds,
    },
    { includeErrorDescription }
  );
  console.log("=== TODO: re-add validateClaimExp ===", validateClaimExp);

  const validateClaimMe = defValidateClaim(
    {
      claim: "me",
      op: "==",
      value: canonicalUrl(me),
    },
    { includeErrorDescription }
  );

  // TODO: re-read RFC7662 and decide which scope to check
  // https://www.rfc-editor.org/rfc/rfc7662
  // const validateScopeIntrospect = defValidateScope({ scope: 'introspect' })

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription,
    isAccessTokenRevoked,
  });

  // === ROUTES ============================================================= //
  fastify.post(
    "/introspect",
    {
      preHandler: [
        decodeAccessToken,
        // validateClaimExp,
        validateClaimMe,
        // validateClaimJti,
        validateAccessTokenNotRevoked,
      ],
      schema: {
        body: introspection_request_body,
        response: {
          200: introspection_response_body_success,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defIntrospectPost({
      ajv,
      includeErrorDescription,
      isAccessTokenRevoked,
      issuer,
      jwks_url,
      logPrefix: log_prefix,
      //  max_token_age
    })
  );

  done();
};

/**
 * Plugin that adds a token introspection endpoint to a Fastify server.
 *
 * @see [RFC7662 OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662)
 */
export default fp(introspectionEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
