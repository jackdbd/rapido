import path from "node:path";
import { fileURLToPath } from "node:url";
import view from "@fastify/view";
import authorizationEndpoint from "@jackdbd/fastify-authorization-endpoint";
import micropubEndpoint from "@jackdbd/fastify-micropub-endpoint";
import tokenEndpoint from "@jackdbd/fastify-token-endpoint";
import Fastify from "fastify";
import nunjucks from "nunjucks";
import type { Environment } from "nunjucks";
import { tap } from "./nunjucks/filters.js";
import {
  create,
  deleteContentOrMedia,
  isAccessTokenRevoked,
  onAuthorizationCodeVerified,
  onIssuedTokens,
  onUserApprovedRequest,
  retrieveAuthorizationCode,
  retrieveRefreshToken,
  undelete,
  update,
} from "./user-provided-functions.js";
import { jwks } from "../../../packages/stdlib/lib/test-utils.js";
import type { Config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const defFastify = (config: Config) => {
  const {
    authorization_endpoint,
    includeErrorDescription,
    issuer,
    log_level,
    me,
    media_endpoint,
    micropub_endpoint,
    reportAllAjvErrors,
    revocation_endpoint,
    syndicate_to,
    userinfo_endpoint,
  } = config;

  const fastify = Fastify({
    logger: {
      // https://getpino.io/#/docs/help?id=level-string
      formatters: {
        level: (label) => {
          return {
            level: label,
          };
        },
      },
      level: log_level,
    },
  });

  const logPrefix = "[app] ";

  const custom_header_filepath = path.join(
    __dirname,
    "..",
    "components",
    "custom-header.webc"
  );

  // === PLUGINS ============================================================ //
  fastify.register(authorizationEndpoint, {
    // authorizationCodeExpiration: "180 seconds",
    components: {
      "the-header": custom_header_filepath,
    },
    includeErrorDescription,
    issuer,
    onAuthorizationCodeVerified,
    onUserApprovedRequest,
    reportAllAjvErrors,
    retrieveAuthorizationCode,
  });

  fastify.register(micropubEndpoint, {
    create,
    delete: deleteContentOrMedia,
    includeErrorDescription,
    isAccessTokenRevoked,
    me,
    mediaEndpoint: media_endpoint,
    micropubEndpoint: micropub_endpoint,
    reportAllAjvErrors,
    syndicateTo: syndicate_to,
    undelete,
    update,
  });

  fastify.register(tokenEndpoint, {
    authorizationEndpoint: authorization_endpoint,
    isAccessTokenRevoked,
    issuer,
    jwks,
    onIssuedTokens,
    retrieveRefreshToken,
    revocationEndpoint: revocation_endpoint,
    userinfoEndpoint: userinfo_endpoint,
  });

  // https://github.com/fastify/point-of-view?tab=readme-ov-file#migrating-from-view-to-viewasync
  fastify.register(view, {
    engine: { nunjucks },
    templates: [path.join(__dirname, "..", "templates")],
    options: {
      onConfigure: (env: Environment) => {
        const xs = [{ name: "tap", fn: tap }];
        xs.forEach(({ name, fn }) => env.addFilter(name, fn));
        const filters = xs.map(({ name }) => name).join(", ");

        const gg = [{ name: "foo", value: "bar" }];
        gg.forEach(({ name, value }) => env.addGlobal(name, value));
        const globals = gg.map(({ name }) => name).join(", ");

        fastify.log.debug(
          { filters, globals },
          `${logPrefix}configured nunjucks environment`
        );
      },
    },
  });

  // === DECORATORS ========================================================= //

  // === HOOKS ============================================================== //

  // === ROUTES ============================================================= //
  fastify.get("/auth/callback", (request, reply) => {
    return reply.send({
      message: "auth callback done",
      headers: request.headers,
      query: request.query,
    });
  });

  fastify.get("/", async (_request, reply) => {
    return reply.viewAsync("home.njk", { name: "User" });
  });

  // https://micropub.spec.indieweb.org/#querying
  fastify.get("/micropub/config", async (request, reply) => {
    const response = await fetch(`${micropub_endpoint}?q=config`, {
      method: "GET",
      headers: {},
    });

    const payload = await response.json();
    request.log.debug(payload, `${logPrefix}micropub endpoint configuration`);

    return reply.viewAsync("success.njk", {
      title: "Micropub config",
      description: "Configuration for the Micropub endpoint",
      summary: "Micropub endpoint configuration",
      payload,
    });
  });

  return fastify;
};
