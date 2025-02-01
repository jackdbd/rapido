import { Type } from "@sinclair/typebox";
import { DEFAULT } from "../constants.js";

export const ajv = Type.Any({ description: "Instance of Ajv" });

export const include_error_description = Type.Boolean({
  description: `Whether to include an \`error_description\` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.`,
  default: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
});

// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7
export const jti = Type.String({
  description: `Unique identifier for the JWT`,
  minLength: 1,
  title: '"jti" (JWT ID) Claim',
});

export const log_prefix = Type.String({ default: DEFAULT.LOG_PREFIX });

export const report_all_ajv_errors = Type.Boolean({
  description: "Whether to report all AJV validation errors.",
  title: "report all AJV errors",
  default: DEFAULT.REPORT_ALL_AJV_ERRORS,
});

export const url = Type.String({
  description: "A URL",
  format: "uri",
});
