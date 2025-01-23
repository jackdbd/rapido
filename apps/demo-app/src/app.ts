import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import authorizationEndpoint from "@jackdbd/fastify-authorization-endpoint";
import tokenEndpoint from "@jackdbd/fastify-token-endpoint";
import {
  isAccessTokenRevoked,
  onAuthorizationCodeVerified,
  onIssuedTokens,
  onUserApprovedRequest,
  retrieveAuthorizationCode,
  retrieveRefreshToken,
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
    reportAllAjvErrors,
    revocation_endpoint,
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
  } as any);

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

  return fastify;
};
