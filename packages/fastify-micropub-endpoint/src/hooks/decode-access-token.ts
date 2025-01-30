import { safeDecode, type AccessTokenClaims } from "@jackdbd/oauth2-tokens";
import type { preHandlerAsyncHookHandler } from "fastify";
import { accessTokenFromRequestHeader } from "../utils.js";

export const decodeAccessToken: preHandlerAsyncHookHandler = async (
  request,
  _reply
) => {
  const { error, value } = accessTokenFromRequestHeader(request);

  if (error) {
    throw error;
  }

  const { error: decode_error, value: claims } =
    await safeDecode<AccessTokenClaims>(value);

  if (decode_error) {
    throw decode_error;
  }
  request.requestContext.set("access_token_claims", claims);
};
