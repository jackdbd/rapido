import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import fastifyRequestContext from "@fastify/request-context";
import responseValidation from "@fastify/response-validation";
import canonicalUrl from "@jackdbd/canonical-url";
import * as jf2 from "@jackdbd/microformats2";
import { error_response } from "@jackdbd/oauth2";
import {
  InvalidRequestError,
  ServerError,
} from "@jackdbd/oauth2-error-responses";
import {
  unixTimestampInSeconds,
  type AccessTokenClaims,
} from "@jackdbd/oauth2-tokens";
import { conformResult } from "@jackdbd/schema-validators";
import type { Jf2 } from "@paulrobertlloyd/mf2tojf2";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

import { decodeAccessToken } from "./hooks/decode-access-token.js";
import { defValidateClaim } from "./hooks/validate-claim.js";
import { defValidateNotRevoked } from "./hooks/validate-not-revoked.js";
import { defMicropubGet } from "./routes/micropub-get.js";
import { defMicropubPost } from "./routes/micropub-post.js";
import {
  micropub_get_request_querystring,
  micropub_post_request_body_jf2,
  options as options_schema,
} from "./schemas/index.js";
import type { Options } from "./schemas/index.js";
import { DEFAULT, NAME } from "./constants.js";

export {
  create,
  deleteContentOrMedia,
  isAccessTokenRevoked,
  micropub_get_request_querystring,
  micropub_post_request_body_jf2,
  options as plugin_options,
  undelete,
  update,
} from "./schemas/index.js";
export type {
  Create,
  DeleteContentOrMedia,
  IsAccessTokenRevoked,
  MicropubGetConfig,
  Options as PluginOptions,
  Undelete,
  Update,
} from "./schemas/index.js";

declare module "@fastify/request-context" {
  interface RequestContextData {
    access_token_claims?: AccessTokenClaims;
    jf2?: Jf2;
  }
}

const defaults = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  multipartFormDataMaxFileSize: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
  syndicateTo: DEFAULT.SYNDICATE_TO,
};

const micropubEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign(defaults, options);

  // console.log(`=== process.env.BASE_URL ===`, process.env.BASE_URL);
  // console.log(`=== process.env.HOST ===`, process.env.HOST);
  // console.log(`=== process.env.PORT ===`, process.env.PORT);
  // const default_media_endpoint = `${process.env.BASE_URL}/media`
  // const default_micropub_endpoint = `${process.env.BASE_URL}/micropub`

  let ajv: Ajv;
  if (config.ajv) {
    ajv = config.ajv;
  } else {
    // I have no idea why I have to do this to make TypeScript happy.
    // In JavaScript, Ajv and addFormats can be imported without any of this mess.
    const addFormatsPlugin = addFormats as any as AjvPlugin<string[]>;
    ajv = addFormatsPlugin(
      new Ajv({ allErrors: config.reportAllAjvErrors, schemas: [] }),
      ["date", "date-time", "duration", "email", "uri"]
    );
  }

  fastify.addSchema(jf2.dt_accessed);
  fastify.addSchema(jf2.dt_duration);
  fastify.addSchema(jf2.dt_end);
  fastify.addSchema(jf2.dt_published);
  fastify.addSchema(jf2.dt_start);
  fastify.addSchema(jf2.dt_updated);
  fastify.addSchema(jf2.e_content);
  fastify.addSchema(jf2.h_adr);
  fastify.addSchema(jf2.h_card);
  fastify.addSchema(jf2.h_cite);
  fastify.addSchema(jf2.h_entry);
  fastify.addSchema(jf2.h_event);
  fastify.addSchema(jf2.h_geo);
  fastify.addSchema(jf2.p_author);
  fastify.addSchema(jf2.p_description);
  fastify.addSchema(jf2.p_geo);
  fastify.addSchema(jf2.p_location);
  fastify.addSchema(jf2.p_publication);
  fastify.addSchema(jf2.p_rsvp);
  fastify.addSchema(jf2.p_summary);
  fastify.addSchema(jf2.u_syndication);
  fastify.addSchema(jf2.u_url);

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: "micropub-endpoint-options" }
  );

  if (error) {
    return done(error);
  }

  const {
    create,
    delete: deleteContent,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
    me,
    mediaEndpoint,
    micropubEndpoint,
    multipartFormDataMaxFileSize,
    syndicateTo,
    undelete,
    update,
  } = value.validated as Required<Options>;

  // === PLUGINS ============================================================ //
  fastify.register(formbody);
  fastify.log.debug(
    `${logPrefix}registered plugin: @fastify/formbody (for parsing application/x-www-form-urlencoded)`
  );

  fastify.register(multipart, {
    limits: {
      fileSize: multipartFormDataMaxFileSize,
    },
  });
  fastify.log.debug(
    `${logPrefix}registered plugin: @fastify/multipart (for parsing multipart/form-data)`
  );

  fastify.register(fastifyRequestContext);
  fastify.log.debug(`${logPrefix}registered plugin: @fastify/request-context`);

  if (process.env.NODE_ENV === "development") {
    fastify.register(responseValidation);
    fastify.log.debug(
      `${logPrefix}registered plugin: @fastify/response-validation`
    );
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook("onRoute", (routeOptions) => {
    fastify.log.debug(
      `${logPrefix}registered route ${routeOptions.method} ${routeOptions.url}`
    );
  });

  // TODO: re-read RFC7662 and decide which scope to check
  // https://www.rfc-editor.org/rfc/rfc7662
  // const validateScopeMedia = defValidateScope({ scope: 'introspect' })

  const validateClaimExp = defValidateClaim(
    {
      claim: "exp",
      op: ">",
      value: unixTimestampInSeconds,
    },
    { includeErrorDescription: include_error_description }
  );
  console.log("=== TODO: re-add validateClaimExp ===", validateClaimExp);

  const validateClaimMe = defValidateClaim(
    {
      claim: "me",
      op: "==",
      value: canonicalUrl(me),
    },
    { includeErrorDescription: include_error_description }
  );

  const validateAccessTokenNotRevoked = defValidateNotRevoked({
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
  });

  // === ROUTES ============================================================= //
  fastify.get(
    "/micropub",
    {
      schema: {
        querystring: micropub_get_request_querystring,
        response: {
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defMicropubGet({
      includeErrorDescription: include_error_description,
      mediaEndpoint,
      syndicateTo,
    })
  );

  fastify.post(
    "/micropub",
    {
      preHandler: [
        decodeAccessToken,
        // validateClaimExp,
        validateClaimMe,
        validateAccessTokenNotRevoked,
      ],
      schema: {
        body: micropub_post_request_body_jf2,
        response: {
          // 200: micropub_response_body_success,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defMicropubPost({
      create,
      delete: deleteContent,
      includeErrorDescription: include_error_description,
      isAccessTokenRevoked,
      logPrefix,
      mediaEndpoint,
      micropubEndpoint,
      undelete,
      update,
    })
  );

  fastify.setErrorHandler((error, request, reply) => {
    const code = error.statusCode;

    // Think about including these data error_description:
    // - some JWT claims (e.g. me, scope)
    // - jf2 (e.g. action, content, h, url)
    // const claims = request.requestContext.get("access_token_claims");
    // const jf2 = request.requestContext.get("jf2");
    // console.log("=== claims ===", claims);
    // console.log("=== jf2 ===", jf2);

    if (code && code >= 400 && code < 500) {
      request.log.warn(
        `${logPrefix}client error catched by error handler: ${error.message}`
      );
    } else {
      request.log.error(
        `${logPrefix}server error catched by error handler: ${error.message}`
      );
    }

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

    // If it's not a client error, is it always a generic Internal Server Error?
    // Probably we can return a HTTP 503 Service Unavailable (maybe use
    // @fastify/under-pressure).
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses

    const error_description = error.message;
    const err = new ServerError({ error_description });
    return reply
      .code(err.statusCode)
      .send(err.payload({ include_error_description }));
  });

  done();
};

export default fp(micropubEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
