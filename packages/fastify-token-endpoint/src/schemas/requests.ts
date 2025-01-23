import { client_id } from "@jackdbd/indieauth";
import {
  authorization_code,
  redirect_uri,
  refresh_token,
  scope,
} from "@jackdbd/oauth2";
import { code_verifier } from "@jackdbd/pkce";
import { Static, Type } from "@sinclair/typebox";

/**
 * Access Token Request body.
 *
 * @see [Access Token Request - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3)
 * @see [Redeeming the Authorization Code - IndieAuth](https://indieauth.spec.indieweb.org/#redeeming-the-authorization-code)
 */
export const access_token_request_body = Type.Object({
  client_id,
  code: authorization_code,
  code_verifier,
  grant_type: Type.Literal("authorization_code"),
  redirect_uri,
});

export type AccessTokenRequestBody = Static<typeof access_token_request_body>;

/**
 * Request body of a refresh request.
 *
 * The requested scope MUST NOT include any scope not originally granted by the
 * resource owner, and if omitted is treated as equal to the scope originally
 * granted by the resource owner.
 *
 * @see [Refreshing an Access Token - The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749#section-6)
 */
export const refresh_request_body = Type.Object({
  grant_type: Type.Literal("refresh_token"),
  refresh_token,
  scope: Type.Optional(scope),
});

export type RefreshRequestBody = Static<typeof refresh_request_body>;
