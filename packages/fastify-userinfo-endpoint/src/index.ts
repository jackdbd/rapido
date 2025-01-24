import responseValidation from "@fastify/response-validation";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { profile } from "@jackdbd/indieauth";
import { error_response } from "@jackdbd/oauth2";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { DEFAULT, NAME } from "./constants.js";
import { defUserinfoGet } from "./routes/userinfo-get.js";
import { options as options_schema, type Options } from "./schemas/index.js";

export {
  isAccessTokenRevoked,
  options as plugin_options,
  retrieveUserProfile,
  userinfo_get_config,
  user_profile_immutable_record,
  user_profile_mutable_record,
} from "./schemas/index.js";
export type {
  IsAccessTokenRevoked,
  Options as PluginOptions,
  RetrieveUserProfile,
  UserinfoGetConfig,
  UserProfileImmutableRecord,
  UserProfileMutableRecord,
} from "./schemas/index.js";

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
};

const userinfoEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign(defaults, options);

  const {
    includeErrorDescription,
    isAccessTokenRevoked,
    logPrefix,
    reportAllAjvErrors,
    retrieveUserProfile,
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
    { basePath: "userinfo-endpoint-options" }
  );

  // === PLUGINS ============================================================ //
  if (process.env.NODE_ENV === "development") {
    fastify.register(responseValidation);
    fastify.log.debug(`${logPrefix}registered plugin: response-validation`);
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook("onRoute", (routeOptions) => {
    fastify.log.debug(
      `${logPrefix}registered route ${routeOptions.method} ${routeOptions.url}`
    );
  });

  // const decodeJwtAndSetClaims = defDecodeJwtAndSetClaims({ ajv })

  // const validateClaimMe = defValidateClaim(
  //   { claim: 'me', op: '==', value: me },
  //   { ajv }
  // )

  // const validateClaimExp = defValidateClaim(
  //   {
  //     claim: 'exp',
  //     op: '>',
  //     value: unixTimestampInSeconds
  //   },
  //   { ajv }
  // )

  // const validateClaimJti = defValidateClaim({ claim: 'jti' }, { ajv })

  // const validateAccessTokenNotRevoked =
  //   defValidateAccessTokenNotRevoked({ ajv, isAccessTokenRevoked })

  // const validateScopeEmail = defValidateScope({ ajv, scope: 'email' })

  // const validateScopeProfile = defValidateScope({ ajv, scope: 'profile' })

  // === ROUTES ============================================================= //
  // To fetch the user's profile information, the client makes a GET request to
  // the userinfo endpoint, providing an access token that was issued with the
  // `profile` and/or `email` scopes.
  // https://indieauth.spec.indieweb.org/#user-information
  // https://indieauth.spec.indieweb.org/#profile-information
  fastify.get(
    "/userinfo",
    {
      onRequest: [
        // decodeJwtAndSetClaims,
        // validateClaimExp,
        // validateClaimMe,
        // validateClaimJti,
        // validateScopeEmail,
        // validateScopeProfile,
        // validateAccessTokenNotRevoked
      ],
      schema: {
        // it seems, by reading the IndieAuth spec, that a GET request to the
        // userinfo endpoint has no querystring.
        // https://indieauth.spec.indieweb.org/#user-information
        // querystring: Type.Object({}),
        response: {
          200: profile,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defUserinfoGet({
      ajv,
      includeErrorDescription,
      isAccessTokenRevoked,
      logPrefix,
      retrieveUserProfile,
    })
  );

  done();
};

export default fp(userinfoEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
