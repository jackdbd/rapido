import { Static, Type } from "@sinclair/typebox";

/**
 * Revocation Response.
 *
 * The content of the response body is ignored by the client as all necessary
 * information is conveyed in the response code.
 *
 * @see [OAuth 2.0 Token Revocation (RFC 7009)](https://datatracker.ietf.org/doc/html/rfc7009#section-2.2)
 */
export const revocation_response_body_success = Type.Object(
  {
    message: Type.Optional(Type.String({ minLength: 1 })),
  },
  {
    $id: "revocation-response-body-success",
    title: "revoke POST response",
  }
);

export type RevocationResponseBodySuccess = Static<
  typeof revocation_response_body_success
>;
