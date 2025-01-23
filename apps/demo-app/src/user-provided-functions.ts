import type {
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
  RetrieveAuthorizationCode,
} from "@jackdbd/fastify-authorization-endpoint";
import type {
  IsAccessTokenRevoked,
  OnIssuedTokens,
  RetrieveRefreshToken,
} from "@jackdbd/fastify-token-endpoint";
import { SCOPE } from "../../../packages/stdlib/lib/test-utils.js";
import { defConfig } from "./config.js";

const PREFIX = "user-fx "; // user-provided side effect
const { client_id, me, issuer, redirect_uri } = defConfig(3001);

export const isAccessTokenRevoked: IsAccessTokenRevoked = async (jti) => {
  console.log(
    `[${PREFIX}IsAccessTokenRevoked] checking whether access token jti=${jti} is revoked`
  );
  return false;
};

export const onAuthorizationCodeVerified: OnAuthorizationCodeVerified = async (
  code
) => {
  console.log(`[${PREFIX}OnAuthorizationCodeVerified] code: ${code}`);
};

export const onIssuedTokens: OnIssuedTokens = async (info) => {
  console.log(`[${PREFIX}OnIssuedTokens] info`, info);
};

export const onUserApprovedRequest: OnUserApprovedRequest = async (props) => {
  console.log(`[${PREFIX}OnUserApprovedRequest] props`, props);
};

export const retrieveAuthorizationCode: RetrieveAuthorizationCode = async (
  code: string
) => {
  console.log(
    `[${PREFIX}RetrieveAuthorizationCode] retrieving authorization code: ${code}`
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
    `[${PREFIX}RetrieveRefreshToken] retrieving refresh token ${refresh_token}`
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
