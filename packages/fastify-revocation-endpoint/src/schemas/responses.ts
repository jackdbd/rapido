import { Static, Type } from "@sinclair/typebox";

export const revocation_response_body_success = Type.Object({
  message: Type.Optional(Type.String({ minLength: 1 })),
});

export type RevocationResponseBodySuccess = Static<
  typeof revocation_response_body_success
>;
