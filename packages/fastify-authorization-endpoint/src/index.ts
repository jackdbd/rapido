import path from "node:path";
import { fileURLToPath } from "node:url";
import formbody from "@fastify/formbody";
import { applyToDefaults } from "@hapi/hoek";
import {
  InvalidRequestError,
  ServerError,
} from "@jackdbd/oauth2-error-responses";
import responseValidation from "@fastify/response-validation";
import webc from "@jackdbd/fastify-webc";
import { code_challenge, code_challenge_method } from "@jackdbd/pkce";
import { Type } from "@sinclair/typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { error_response } from "@jackdbd/oauth2";
import { throwWhenNotConform } from "@jackdbd/schema-validators";
import { DEFAULT, NAME } from "./constants.js";
import { defAuthorizePage } from "./routes/authorize-page.js";
import { defAuthorizePost } from "./routes/authorize-post.js";
import { defHandleAction } from "./routes/handle-action.js";
import {
  access_token_request_body,
  authorization_request_querystring,
  authorization_response_body_success,
  handle_action_querystring,
  options as options_schema,
  type Options,
  profile_url_request_body,
  profile_url_response_body_success,
} from "./schemas/index.js";

export {
  access_token_request_body,
  authorization_code_props,
  authorization_code_immutable_record,
  authorization_code_mutable_record,
  authorization_request_querystring,
  authorization_response_body_success,
  authorization_response_querystring,
  options as plugin_options,
  profile_url_request_body,
  profile_url_response_body_success,
} from "./schemas/index.js";
export type {
  AccessTokenRequestBody,
  AuthorizationCodeProps,
  AuthorizationCodeImmutableRecord,
  AuthorizationCodeMutableRecord,
  AuthorizationRequestQuerystring,
  AuthorizationResponseBodySuccess,
  AuthorizationResponseQuerystring,
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  Options as PluginOptions,
  ProfileUrlRequestBody,
  ProfileUrlResponseBodySuccess,
  RetrieveAuthorizationCode,
} from "./schemas/index.js";

declare module "fastify" {
  interface FastifyReply {
    render(template: string, data: Record<string, any>): Promise<void>;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaults = {
  authorizationCodeExpiration: DEFAULT.AUTHORIZATION_CODE_EXPIRATION,
  // TODO: allow the user to pass WebC helper functions and transforms (the user
  // might have implemented WebC components that call those helpers/transforms)
  components: {
    "consent-form": path.join(
      __dirname,
      "webc",
      "components",
      "consent-form.webc"
    ),
    "scope-list": path.join(__dirname, "webc", "components", "scope-list.webc"),
    "the-footer": path.join(__dirname, "webc", "components", "the-footer.webc"),
    "the-header": path.join(__dirname, "webc", "components", "the-header.webc"),
  },
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  redirectPathOnSubmit: DEFAULT.REDIRECT_PATH_ON_SUBMIT,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
  templates: [path.join(__dirname, "webc", "templates")],
};

const authorizationEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = applyToDefaults(
    defaults,
    options as Partial<Options>
  ) as Required<Options>;

  const {
    authorizationCodeExpiration: authorization_code_expiration,
    components,
    includeErrorDescription: include_error_description,
    issuer,
    logPrefix: log_prefix,
    onAuthorizationCodeVerified,
    onUserApprovedRequest,
    redirectPathOnSubmit: redirect_path_on_submit,
    reportAllAjvErrors: report_all_ajv_errors,
    retrieveAuthorizationCode,
    templates,
  } = config;

  // Recommended setup for Ajv when using TypeBox
  // https://github.com/sinclairzx81/typebox?tab=readme-ov-file#ajv
  let ajv: Ajv;
  if (config.ajv) {
    ajv = config.ajv as Ajv;
  } else {
    ajv = (addFormats as any)(new Ajv({ allErrors: report_all_ajv_errors }), [
      "email",
      "uri",
    ]);
  }

  throwWhenNotConform(
    { ajv, schema: options_schema, data: config },
    { basePath: "authorization-endpoint options" }
  );

  fastify.addSchema(code_challenge);
  fastify.addSchema(code_challenge_method);

  // === PLUGINS ============================================================ //
  // Parse application/x-www-form-urlencoded requests
  fastify.register(formbody);
  fastify.log.debug(`${log_prefix}registered plugin: formbody`);

  fastify.register(webc, { components, templates });
  fastify.log.debug(`${log_prefix}registered plugin: fastify-webc`);

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
  // fastify.get("/authorize", (_request, reply) => {
  //   const data = {
  //     authorization_code_expiration,
  //     client_id: "https://micropub.fly.dev/id",
  //     client_name: "Pulp",
  //     client_uri: "https://micropub.fly.dev/",
  //     code_challenge: "123456789012345678901234567890123456789012345",
  //     code_challenge_method: "plain",
  //     description: "Authorization page with user consent screen.",
  //     logo_uri: "https://example.com/logo.png",
  //     me: "https://www.giacomodebidda.com/",
  //     redirect_path_on_submit,
  //     redirect_uri: "http://localhost:3001/auth/callback",
  //     redirect_uri_on_deny: "http://localhost:3001/",
  //     scopes: ["create", "update"],
  //     state: "some-state",
  //     title: "Authorize",
  //   };
  //   return reply.render("authorize.webc", data);
  // });

  fastify.get(
    "/auth",
    {
      schema: {
        querystring: authorization_request_querystring,
        response: {
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defAuthorizePage({
      authorization_code_expiration,
      include_error_description,
      log_prefix,
      redirect_path_on_submit,
    })
  );

  fastify.post(
    "/auth",
    {
      schema: {
        body: Type.Union([access_token_request_body, profile_url_request_body]),
        response: {
          200: Type.Union([
            authorization_response_body_success,
            profile_url_response_body_success,
          ]),
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defAuthorizePost({
      include_error_description,
      log_prefix,
      onAuthorizationCodeVerified,
      retrieveAuthorizationCode,
    })
  );

  fastify.get(
    redirect_path_on_submit,
    // TODO: redirect if not authenticated with ANY one of the authentication
    // providers (e.g. GitHub via RelMeAuth). For example, we need a valid
    // GitHub access token to be considered authenticated with GitHub; we do NOT
    // need a valid access token from the IndieAuth authorization server.
    // Before issuing an authorization code, the authorization server MUST first
    // verify the identity of the resource owner.
    {
      // onRequest: [redirectWhenNotAuthenticated],
      schema: {
        querystring: handle_action_querystring,
        response: {
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defHandleAction({
      authorization_code_expiration,
      include_error_description,
      issuer,
      log_prefix,
      onUserApprovedRequest,
    })
  );

  fastify.setErrorHandler((error, _request, reply) => {
    const code = error.statusCode;
    if (error.validation && error.validationContext) {
      if (code && code >= 400 && code < 500) {
        const messages = error.validation.map((ve) => {
          return `${error.validationContext}${ve.instancePath} ${ve.message}`;
        });
        const error_description = messages.join("; ");
        const err = new InvalidRequestError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      }
    }

    const error_description = error.message;
    const err = new ServerError({ error_description });
    return reply
      .code(err.statusCode)
      .send(err.payload({ include_error_description }));
  });

  done();
};

export default fp(authorizationEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
