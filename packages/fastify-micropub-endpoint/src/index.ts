import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import responseValidation from "@fastify/response-validation";
// import canonicalUrl from "@jackdbd/canonical-url";
import {
  dt_accessed,
  dt_duration,
  dt_end,
  dt_published,
  dt_start,
  dt_updated,
  e_content,
  h_adr,
  h_card,
  h_cite,
  h_entry,
  h_event,
  h_geo,
  p_author,
  p_description,
  p_geo,
  p_location,
  p_publication,
  p_rsvp,
  p_summary,
  u_syndication,
  u_url,
} from "@jackdbd/microformats2";
import { error_response } from "@jackdbd/oauth2";
import {
  InvalidRequestError,
  ServerError,
} from "@jackdbd/oauth2-error-responses";
// import { unixTimestampInSeconds } from "@jackdbd/oauth2-tokens";
import { conformResult } from "@jackdbd/schema-validators";
import type { Jf2 } from "@paulrobertlloyd/mf2tojf2";
import { Ajv, type Plugin as AjvPlugin } from "ajv";
import addFormats from "ajv-formats";
import type { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { defMicropubGet } from "./routes/micropub-get.js";
import { defMicropubPost } from "./routes/micropub-post.js";
// import {
//   defDecodeJwtAndSetClaims,
//   defValidateAccessTokenNotRevoked,
//   defValidateClaim
// } from '../../lib/fastify-hooks/index.js'
import { DEFAULT, NAME } from "./constants.js";
import {
  micropub_get_request_querystring,
  micropub_post_request_body_jf2,
  options as options_schema,
} from "./schemas/index.js";
import type { Options } from "./schemas/index.js";

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

  fastify.addSchema(dt_accessed);
  fastify.addSchema(dt_duration);
  fastify.addSchema(dt_end);
  fastify.addSchema(dt_published);
  fastify.addSchema(dt_start);
  fastify.addSchema(dt_updated);
  fastify.addSchema(e_content);
  fastify.addSchema(h_adr);
  fastify.addSchema(h_card);
  fastify.addSchema(h_cite);
  fastify.addSchema(h_entry);
  fastify.addSchema(h_event);
  fastify.addSchema(h_geo);
  fastify.addSchema(p_author);
  fastify.addSchema(p_description);
  fastify.addSchema(p_geo);
  fastify.addSchema(p_location);
  fastify.addSchema(p_publication);
  fastify.addSchema(p_rsvp);
  fastify.addSchema(p_summary);
  fastify.addSchema(u_syndication);
  fastify.addSchema(u_url);

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
    `${logPrefix}registered plugin: formbody (for parsing application/x-www-form-urlencoded)`
  );

  fastify.register(multipart, {
    limits: {
      fileSize: multipartFormDataMaxFileSize,
    },
  });
  fastify.log.debug(
    `${logPrefix}registered plugin: multipart (for parsing multipart/form-data)`
  );

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
  fastify.get(
    "/micropub",
    {
      // onError: (request, _reply, error, done) => {
      //   console.log("=== onError request.query ===", request.query);
      //   console.log("=== onError error ===", error);
      //   done();
      // },
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
      onRequest: [
        // decodeJwtAndSetClaims,
        // logIatAndExpClaims,
        // validateClaimExp,
        // validateClaimMe,
        // validateClaimJti,
        // validateAccessTokenNotRevoked
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
