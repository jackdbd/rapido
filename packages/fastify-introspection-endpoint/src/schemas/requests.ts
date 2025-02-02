import { access_token, refresh_token } from "@jackdbd/oauth2";
import { Static, Type } from "@sinclair/typebox";
import { token_type_hint } from "./common.js";

/**
 * Introspection Request.
 *
 * @see [Access Token Verification Request - IndieAuth ](https://indieauth.spec.indieweb.org/#x6-1-access-token-verification-request)
 * @see [OAuth 2.0 Token Introspection (RFC 7662)](https://www.rfc-editor.org/rfc/rfc7662#section-2.1)
 */
export const introspection_request_body = Type.Object(
  {
    token: Type.Union([access_token, refresh_token]),
    token_type_hint: Type.Optional(token_type_hint),
  },
  {
    $id: "introspection-request-body",
    additionalProperties: false,
    description: "The body sent by the client with a POST request.",
    title: "Introspection POST request",
  }
);

export type IntrospectionRequestBody = Static<
  typeof introspection_request_body
>;
