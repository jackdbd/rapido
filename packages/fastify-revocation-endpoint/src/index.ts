import formbody from "@fastify/formbody";
import responseValidation from "@fastify/response-validation";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { error_response } from "@jackdbd/oauth2";
// import { unixTimestampInSeconds } from "@jackdbd/oauth2-tokens";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
// import {
//   defDecodeJwtAndSetClaims,
//   defValidateAccessTokenNotRevoked,
//   defValidateClaim
// } from '../../lib/fastify-hooks/index.js'
import { DEFAULT, NAME } from "./constants.js";
import { defRevocationPost } from "./routes/revocation-post.js";
import {
  options as options_schema,
  revocation_request_body,
  revocation_response_body_success,
} from "./schemas/index.js";
import type { Options } from "./schemas/index.js";

export {
  access_token_props,
  refresh_token_props,
  revocation_request_body,
  revocation_response_body_success,
  isAccessTokenRevoked,
  retrieveAccessToken,
  retrieveRefreshToken,
  revokeAccessToken,
  revokeRefreshToken,
  options as plugin_options,
} from "./schemas/index.js";
export type {
  AccessTokenProps,
  RefreshTokenProps,
  RevocationRequestBody,
  RevocationResponseBodySuccess,
  IsAccessTokenRevoked,
  RetrieveAccessToken,
  RetrieveRefreshToken,
  RevokeAccessToken,
  RevokeRefreshToken,
  Options as PluginOptions,
} from "./schemas/index.js";

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
};

const revocationEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign(defaults, options);

  const { reportAllAjvErrors } = config;

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

  const {
    includeErrorDescription: include_error_description,
    // isAccessTokenRevoked,
    issuer,
    jwksUrl: jwks_url,
    logPrefix: log_prefix,
    maxAccessTokenAge: max_access_token_age,
    me,
    retrieveAccessToken,
    retrieveRefreshToken,
    revokeAccessToken,
    revokeRefreshToken,
  } = config;

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
  // const validateScopeMedia = defValidateScope({ scope: 'introspect' })

  // const validateAccessTokenNotRevoked = defValidateAccessTokenNotRevoked({
  //   ajv,
  //   isAccessTokenRevoked,
  // });

  // === ROUTES ============================================================= //
  fastify.post(
    "/revoke",
    {
      onRequest: [
        // decodeJwtAndSetClaims,
        // validateClaimExp,
        // validateClaimMe,
        // validateClaimJti,
        // validateAccessTokenNotRevoked,
      ],
      schema: {
        body: revocation_request_body,
        response: {
          200: revocation_response_body_success,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defRevocationPost({
      ajv,
      include_error_description,
      issuer,
      jwks_url,
      log_prefix,
      max_access_token_age,
      me,
      retrieveAccessToken,
      retrieveRefreshToken,
      revokeAccessToken,
      revokeRefreshToken,
    })
  );

  done();
};

export default fp(revocationEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
