import { access_token, refresh_token } from "@jackdbd/oauth2";
import { Static, Type } from "@sinclair/typebox";
import { token_type_hint } from "./common.js";

export const introspection_request_body = Type.Object(
  {
    token: Type.Union([access_token, refresh_token]),
    token_type_hint: Type.Optional(token_type_hint),
  },
  {
    $id: "introspection-request-body",
    additionalProperties: false,
    description: "The body sent by the client with a POST request.",
    title: "introspect POST request",
  }
);

export type IntrospectionRequestBody = Static<
  typeof introspection_request_body
>;
