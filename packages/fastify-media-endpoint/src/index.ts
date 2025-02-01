import multipart from "@fastify/multipart";
import fastifyRequestContext from "@fastify/request-context";
import responseValidation from "@fastify/response-validation";
import canonicalUrl from "@jackdbd/canonical-url";
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
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

import { DEFAULT, NAME } from "./constants.js";
import { decodeAccessToken } from "./hooks/decode-access-token.js";
import { defValidateClaim } from "./hooks/validate-claim.js";
import { defValidateNotRevoked } from "./hooks/validate-not-revoked.js";
import { defMediaPost } from "./routes/media-post.js";
import { options as options_schema, type Options } from "./schemas/index.js";

export {
  deleteContentOrMedia,
  isAccessTokenRevoked,
  options as plugin_options,
  uploadMedia,
} from "./schemas/index.js";
export type {
  DeleteContentOrMedia,
  IsAccessTokenRevoked,
  Options as PluginOptions,
  UploadMedia,
} from "./schemas/index.js";

declare module "@fastify/request-context" {
  interface RequestContextData {
    access_token_claims?: AccessTokenClaims;
    // jf2?: Jf2;
  }
}

const defaults: Partial<Options> = {
  includeErrorDescription: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
  logPrefix: DEFAULT.LOG_PREFIX,
  multipartFormDataMaxFileSize: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
  reportAllAjvErrors: DEFAULT.REPORT_ALL_AJV_ERRORS,
};

const mediaEndpoint: FastifyPluginCallback<Options> = (
  fastify,
  options,
  done
) => {
  const config = Object.assign(defaults, options);

  let ajv: Ajv;
  if (config.ajv) {
    ajv = config.ajv;
  } else {
    // I have no idea why I have to do this to make TypeScript happy.
    // In JavaScript, Ajv and addFormats can be imported without any of this mess.
    const addFormatsPlugin = addFormats as any as AjvPlugin<string[]>;
    ajv = addFormatsPlugin(
      new Ajv({ allErrors: config.reportAllAjvErrors, schemas: [] }),
      ["uri"]
    );
  }

  const { error, value } = conformResult(
    { ajv, schema: options_schema, data: config },
    { basePath: "media-endpoint-options" }
  );

  if (error) {
    return done(error);
  }

  const {
    delete: deleteMedia,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix,
    me,
    multipartFormDataMaxFileSize,
    upload,
  } = value.validated as Required<Options>;

  // === PLUGINS ============================================================ //
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
    fastify.log.debug(`${logPrefix}registered plugin: response-validation`);
  }

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //
  fastify.addHook("onRoute", (routeOptions) => {
    fastify.log.debug(
      `${logPrefix}registered route ${routeOptions.method} ${routeOptions.url}`
    );
  });

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
  fastify.post(
    "/media",
    {
      preHandler: [
        decodeAccessToken,
        // validateClaimExp,
        validateClaimMe,
        validateAccessTokenNotRevoked,
      ],
      schema: {
        // body: media_post_request_body,
        response: {
          // 200: media_response_body_success,
          "4xx": error_response,
          "5xx": error_response,
        },
      },
    },
    defMediaPost({
      delete: deleteMedia,
      include_error_description,
      upload,
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

export default fp(mediaEndpoint, {
  fastify: "5.x",
  name: NAME,
  encapsulate: true,
});
