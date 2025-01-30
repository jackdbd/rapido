import type {
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  RetrieveAuthorizationCode,
} from "@jackdbd/fastify-authorization-endpoint";
import type {
  Create,
  DeleteContentOrMedia,
  Undelete,
  Update,
} from "@jackdbd/fastify-micropub-endpoint";
import type {
  IsAccessTokenRevoked,
  OnIssuedTokens,
  RetrieveRefreshToken,
} from "@jackdbd/fastify-token-endpoint";
import { SCOPE } from "../../../packages/stdlib/lib/test-utils.js";
import { defConfig } from "./config.js";

const logPrefix = "user-fx "; // user-provided side effect
const { client_id, me, issuer, redirect_uri } = defConfig(3001);

export const create: Create = async (jf2) => {
  console.log(`[${logPrefix}create] jf2`, jf2);
  // throw new Error("create not implemented");
  return { message: "post created" };
};

export const deleteContentOrMedia: DeleteContentOrMedia = async (url) => {
  console.log(`[${logPrefix}deleteContentOrMedia] url: ${url}`);
  // return { error: new Error("Not implemented") };
  // throw new Error("delete not implemented");
  return { message: `deleted post at url ${url} ` };
};

export const isAccessTokenRevoked: IsAccessTokenRevoked = async (jti) => {
  console.log(
    `[${logPrefix}isAccessTokenRevoked] checking whether access token jti=${jti} is revoked`
  );
  // throw new Error(`fake database connection failed`);
  return false;
  // return true;
};

export const onAuthorizationCodeVerified: OnAuthorizationCodeVerified = async (
  code
) => {
  console.log(`[${logPrefix}onAuthorizationCodeVerified] code: ${code}`);
};

export const onIssuedTokens: OnIssuedTokens = async (info) => {
  console.log(`[${logPrefix}onIssuedTokens] info`, info);
};

export const onUserApprovedRequest: OnUserApprovedRequest = async (props) => {
  console.log(`[${logPrefix}OnUserApprovedRequest] props`, props);
};

export const retrieveAuthorizationCode: RetrieveAuthorizationCode = async (
  code: string
) => {
  console.log(
    `[${logPrefix}retrieveAuthorizationCode] retrieving authorization code: ${code}`
  );
  // client_id: https://micropub.fly.dev/id
  return {
    client_id,
    code,
    code_challenge: "",
    code_challenge_method: "",
    created_at: 456,
    exp: 123,
    iss: issuer,
    me,
    redirect_uri,
    scope: SCOPE,
  };
};

export const retrieveRefreshToken: RetrieveRefreshToken = async (
  refresh_token
) => {
  console.log(
    `[${logPrefix}retrieveRefreshToken] retrieving refresh token ${refresh_token}`
  );
  return {
    client_id,
    code: "",
    code_challenge: "",
    code_challenge_method: "",
    created_at: 456,
    exp: 123,
    iss: issuer,
    jti: "some-jwt-id",
    me,
    redirect_uri,
    refresh_token,
    scope: SCOPE,
  };
};

export const undelete: Undelete = async (url) => {
  console.log(`[${logPrefix}undelete] url: ${url}`);
  // return { error: new Error("Not implemented") };
  // throw new Error("undeleted not implemented");
  return { message: `undeleted post at url ${url} ` };
};

export const update: Update = async (url, patch) => {
  console.log(`[${logPrefix}update] url: ${url}`, patch);
  // throw new Error("update not implemented");
  return { message: `updated post at url ${url} ` };
};
