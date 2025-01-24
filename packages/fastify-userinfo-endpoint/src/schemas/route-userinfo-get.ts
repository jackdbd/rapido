import { Static, Type } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import { ajv, include_error_description, log_prefix } from "./common.js";
import {
  isAccessTokenRevoked,
  retrieveUserProfile,
} from "./user-provided-functions.js";
import type {
  IsAccessTokenRevoked,
  RetrieveUserProfile,
} from "./user-provided-functions.js";

export const userinfo_get_config = Type.Object(
  {
    ajv,
    includeErrorDescription: include_error_description,
    isAccessTokenRevoked,
    logPrefix: log_prefix,
    retrieveUserProfile,
  },
  {
    additionalProperties: false,
    $id: "userinfo-endpoint-get-method-config",
  }
);

export interface UserinfoGetConfig extends Static<typeof userinfo_get_config> {
  ajv: Ajv;
  isAccessTokenRevoked: IsAccessTokenRevoked;
  retrieveUserProfile: RetrieveUserProfile;
}
