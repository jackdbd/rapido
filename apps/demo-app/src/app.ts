import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import authorizationEndpoint from "@jackdbd/fastify-authorization-endpoint";
import type {
  AuthorizationCodeProps,
  OnAuthorizationCodeVerified,
  RetrieveAuthorizationCode,
} from "@jackdbd/fastify-authorization-endpoint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
  authorization_endpoint: string;
  includeErrorDescription: boolean;
  issuer: string;
  log_level: string;
  reportAllAjvErrors: boolean;
  token_endpoint: string;
}

const onAuthorizationCodeVerified: OnAuthorizationCodeVerified = async (
  code
) => {
  console.log(`do something with the code: ${code}`);
};

const retrieveAuthorizationCode: RetrieveAuthorizationCode = async (
  code: string
) => {
  console.log(`retrieve code: ${code}`);
  // client_id: https://micropub.fly.dev/id
  return {
    client_id: "",
    code,
    code_challenge: "",
    code_challenge_method: "",
    created_at: 456,
    exp: 123,
    iss: "some-issuer",
    me: "",
    redirect_uri: "",
    scope: "",
  };
};

export const defFastify = (config: Config) => {
  const {
    // authorization_endpoint,
    includeErrorDescription,
    issuer,
    log_level,
    reportAllAjvErrors,
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
    onUserApprovedRequest: async (props: AuthorizationCodeProps) => {
      console.log(`do something with these props:`, props);
    },
    reportAllAjvErrors,
    retrieveAuthorizationCode,
  } as any);

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
