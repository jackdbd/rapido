import { issuer } from "@jackdbd/indieauth";
import { jwks_url } from "@jackdbd/oauth2-tokens";
import { Static, Type } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import {
  ajv,
  include_error_description,
  log_prefix,
  report_all_ajv_errors,
} from "./common.js";
import { isAccessTokenRevoked } from "./user-provided-functions.js";
import type { IsAccessTokenRevoked } from "./user-provided-functions.js";

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked,

    issuer,

    jwksUrl: jwks_url,

    logPrefix: Type.Optional(log_prefix),

    // maxAccessTokenAge: Type.Optional(Type.String({ minLength: 1 })),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),
  },
  {
    $id: "fastify-introspection-endpoint-options",
    description: "Options for the Fastify introspection-endpoint plugin",
    title: "Introspection Endpoint Options",
  }
);

export interface Options extends Static<typeof options> {
  ajv?: Ajv;
  isAccessTokenRevoked: IsAccessTokenRevoked;
}
