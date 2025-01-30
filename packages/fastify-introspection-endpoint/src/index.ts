import formbody from "@fastify/formbody";
import responseValidation from "@fastify/response-validation";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { error_response } from "@jackdbd/oauth2";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
// import {
//   defDecodeJwtAndSetClaims,
//   defValidateAccessTokenNotRevoked,
//   defValidateClaim
// } from '../../lib/fastify-hooks/index.js'
import { defIntrospectPost } from "./routes/introspect-post.js";
import { DEFAULT, NAME } from "./constants.js";
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
  const config = Object.assign(defaults, options);

  const {
    includeErrorDescription,
    logPrefix: log_prefix,
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

  // const decodeJwtAndSetClaims = defDecodeJwtAndSetClaims({ ajv });

  // Should I check whether the token from the Authorization header matches an
  // expected a `me` claim?
  // const validateClaimMe = defValidateClaim(
  //   { claim: 'me', op: '==', value: me },
  //   { ajv }
  // )

  // The access token provided in the Authorization header (which may differ
  // from the token in the request body) must not be expired.
  // const validateClaimExp = defValidateClaim(
  //   {
  //     claim: "exp",
  //     op: ">",
  //     value: unixTimestampInSeconds,
  //   },
  //   { ajv }
  // );

  // const validateClaimJti = defValidateClaim({ claim: "jti" }, { ajv });

  // TODO: re-read RFC7662 and decide which scope to check
  // https://www.rfc-editor.org/rfc/rfc7662
  // const validateScopeMedia = defValidateScope({ scope: 'introspect' })

  // const validateAccessTokenNotRevoked = defValidateAccessTokenNotRevoked({
  //   ajv,
  //   isAccessTokenRevoked,
  // });

  // === ROUTES ============================================================= //
  fastify.post(
    "/introspect",
    {
      onRequest: [
        // decodeJwtAndSetClaims,
        // validateClaimExp,
        // validateClaimJti,
        // validateAccessTokenNotBlacklisted
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
