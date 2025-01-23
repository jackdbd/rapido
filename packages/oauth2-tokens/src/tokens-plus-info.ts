import { conformResult } from "@jackdbd/schema-validators";
import { Type, type Static } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import {
  client_id,
  issuer,
  me_after_url_canonicalization,
} from "@jackdbd/indieauth";
import {
  access_token,
  expires_in,
  redirect_uri,
  refresh_token,
  scope,
} from "@jackdbd/oauth2";
import { accessToken } from "./access-token.js";
import { safeDecode } from "./decode-jwt.js";
import type { AccessTokenClaims } from "./jwt-claims.js";
import { refreshToken } from "./refresh-token.js";
import { exp, expiration, jti, jwks_private, kid } from "./schemas/index.js";

export const config_schema = Type.Object({
  access_token_expiration: expiration,
  client_id,
  issuer,
  jwks: jwks_private,
  me: me_after_url_canonicalization,
  redirect_uri,
  refresh_token_expiration: expiration,
  scope,
});

export interface Config extends Static<typeof config_schema> {
  ajv: Ajv;
}

export const return_value_schema = Type.Object(
  {
    access_token,
    access_token_expires_in: expires_in,
    client_id,
    issuer,
    jti,
    kid,
    me: me_after_url_canonicalization,
    redirect_uri,
    refresh_token,
    refresh_token_expires_at: exp,
    scope,
  },
  {
    $id: "tokens-plus-info",
    additionalProperties: false,
    title: "Tokens Plus Info",
    description:
      "Access token, refresh token, and some additional information about the issuer, the client, and the end-user.",
    // examples: [],
  }
);

// I think that `me` is always the end-user. Calling it resource owner doesn't seem correct.
// https://stackoverflow.com/questions/6269376/oauth-what-exactly-is-a-resource-owner-when-is-it-not-an-end-user

export type ReturnValue = Static<typeof return_value_schema>;

/**
 * Issues an access token, a refresh token, and returns some additional
 * information about them.
 *
 * This function returns:
 *
 * - an access token (implemented as a JWT)
 * - a refresh token (implemented as a random string)
 * - some information about the authorization server that issued the tokens
 * - the client application that requested the tokens
 * - the end-user whose resources the access token grants access to
 */
export const tokensPlusInfo = async (config: Config) => {
  const ajv = config.ajv;

  const { error: config_conform_error, value: config_validated } =
    conformResult(
      {
        ajv,
        schema: config_schema,
        data: config,
      },
      { basePath: "tokensPlusInfo-config" }
    );

  if (config_conform_error) {
    return { error: config_conform_error };
  }

  const {
    access_token_expiration,
    client_id,
    issuer,
    jwks,
    me,
    redirect_uri,
    refresh_token_expiration,
    scope,
  } = config_validated.validated;

  const { error: access_token_error, value: access_token_value } =
    await accessToken({
      ajv,
      expiration: access_token_expiration,
      issuer,
      jwks,
      me,
      scope,
    });

  if (access_token_error) {
    return { error: access_token_error };
  }

  const { access_token, expires_in, kid } = access_token_value;

  const { error: decode_error, value: claims } =
    await safeDecode<AccessTokenClaims>(access_token);

  if (decode_error) {
    return { error: decode_error };
  }

  const { jti } = claims;

  const { error: refresh_token_error, value: refresh_token_value } =
    await refreshToken({
      ajv,
      expiration: refresh_token_expiration,
    });

  if (refresh_token_error) {
    return { error: refresh_token_error };
  }

  const { refresh_token, exp: refresh_token_expires_at } = refresh_token_value;

  const data = {
    access_token,
    access_token_expires_in: expires_in,
    client_id,
    issuer,
    jti,
    kid,
    me,
    redirect_uri,
    refresh_token,
    refresh_token_expires_at,
    scope,
  };

  const { error: return_value_conform_error, value: return_value_validated } =
    conformResult(
      {
        ajv,
        schema: return_value_schema,
        data,
      },
      { basePath: "tokensPlusInfo-return-value" }
    );

  if (return_value_conform_error) {
    return { error: return_value_conform_error };
  }

  return { value: return_value_validated.validated };
};
