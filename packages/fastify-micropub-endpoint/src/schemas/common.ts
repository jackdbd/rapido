import { Type } from "@sinclair/typebox";
import { DEFAULT } from "../constants.js";

export const ajv = Type.Any({ description: "Instance of Ajv" });

export const error = Type.Object({
  message: Type.String(),
  name: Type.String(),
  stack: Type.Optional(Type.String()),
});

export const failure = Type.Object({
  error,
  value: Type.Optional(Type.Undefined()),
});

export const include_error_description = Type.Boolean({
  description: `Whether to include an \`error_description\` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.`,
  default: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
});

export const log_prefix = Type.String({ default: DEFAULT.LOG_PREFIX });

export const media_endpoint = Type.String({
  format: "uri",
  title: "Media endpoint",
});

export const micropub_endpoint = Type.String({
  format: "uri",
  title: "Micropub endpoint",
});

export const report_all_ajv_errors = Type.Boolean({
  description: "Whether to report all AJV validation errors.",
  title: "report all AJV errors",
  default: DEFAULT.REPORT_ALL_AJV_ERRORS,
});

export const sha = Type.String({ minLength: 1 });

export const url = Type.String({
  description: "A URL",
  format: "uri",
});
