import {
  me_before_url_canonicalization,
  me_after_url_canonicalization,
} from "@jackdbd/indieauth";
import { Static, Type } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import { DEFAULT } from "../constants.js";
import {
  ajv,
  include_error_description,
  log_prefix,
  report_all_ajv_errors,
} from "./common.js";
import {
  deleteContentOrMedia,
  isAccessTokenRevoked,
  uploadMedia,
} from "./user-provided-functions.js";
import type {
  DeleteContentOrMedia,
  IsAccessTokenRevoked,
  UploadMedia,
} from "./user-provided-functions.js";

/**
 * Options for the Fastify media-endpoint plugin.
 */
export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    delete: deleteContentOrMedia,

    includeErrorDescription: Type.Optional(include_error_description),

    isAccessTokenRevoked: isAccessTokenRevoked,

    logPrefix: Type.Optional(log_prefix),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization,
    ]),

    multipartFormDataMaxFileSize: Type.Optional(
      Type.Number({
        title: "multipart/form-data max file size",
        description: `Max file size (in bytes) for multipart/form-data requests.`,
        default: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
        minimum: 0,
      })
    ),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    upload: uploadMedia,
  },
  {
    $id: "fastify-media-endpoint-options",
    title: "Fastify plugin media-endpoint options",
    description: "Options for the Fastify media-endpoint plugin",
  }
);

export interface Options extends Static<typeof options> {
  ajv?: Ajv;
  delete: DeleteContentOrMedia;
  isAccessTokenRevoked: IsAccessTokenRevoked;
  upload: UploadMedia;
}
