import { issuer } from "@jackdbd/indieauth";
import { jwks_url } from "@jackdbd/oauth2-tokens";
import { Static, Type } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import { ajv, include_error_description, log_prefix } from "./common.js";
import { isAccessTokenRevoked } from "./user-provided-functions.js";
import type { IsAccessTokenRevoked } from "./user-provided-functions.js";

export const introspect_post_config = Type.Object(
  {
    ajv,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    issuer,
    jwks_url,
    logPrefix: log_prefix,
    // maxAccessTokenAge: Type.String({ minLength: 1 })
  },
  {
    additionalProperties: false,
    $id: "introspection-endpoint-post-method-config",
  }
);

export interface IntrospectPostConfig
  extends Static<typeof introspect_post_config> {
  ajv: Ajv;
  isAccessTokenRevoked: IsAccessTokenRevoked;
}
