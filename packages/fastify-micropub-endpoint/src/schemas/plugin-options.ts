import {
  me_before_url_canonicalization,
  me_after_url_canonicalization,
} from "@jackdbd/indieauth";
import { Static, Type } from "@sinclair/typebox";
import type { Ajv } from "ajv";
import { DEFAULT } from "../constants.js";
import {
  ajv,
  media_endpoint,
  micropub_endpoint,
  report_all_ajv_errors,
} from "./common.js";
import {
  create,
  deleteContentOrMedia,
  isAccessTokenRevoked,
  undelete,
  update,
} from "./user-provided-functions.js";
import type {
  Create,
  DeleteContentOrMedia,
  IsAccessTokenRevoked,
  Undelete,
  Update,
} from "./user-provided-functions.js";
import { syndicate_to_item } from "./syndicate-to.js";

export const options = Type.Object(
  {
    ajv: Type.Optional(ajv),

    create,

    delete: deleteContentOrMedia,

    includeErrorDescription: Type.Optional(
      Type.Boolean({ default: DEFAULT.INCLUDE_ERROR_DESCRIPTION })
    ),

    isAccessTokenRevoked,

    logPrefix: Type.Optional(Type.String({ default: DEFAULT.LOG_PREFIX })),

    me: Type.Union([
      me_before_url_canonicalization,
      me_after_url_canonicalization,
    ]),

    mediaEndpoint: Type.Optional(media_endpoint),

    micropubEndpoint: Type.Optional(micropub_endpoint),

    multipartFormDataMaxFileSize: Type.Optional(
      Type.Number({
        title: "multipart/form-data max file size",
        description: `Max file size (in bytes) for multipart/form-data requests.`,
        default: DEFAULT.MULTIPART_FORMDATA_MAX_FILE_SIZE,
        minimum: 0,
      })
    ),

    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    syndicateTo: Type.Optional(
      Type.Array(syndicate_to_item, { default: DEFAULT.SYNDICATE_TO })
    ),

    undelete: Type.Optional(undelete),

    update,
  },
  {
    $id: "fastify-micropub-endpoint-options",
    description: "Options for the Fastify micropub-endpoint plugin",
    title: "Micropub Endpoint Options",
  }
);

export interface Options extends Static<typeof options> {
  ajv?: Ajv;
  create: Create;
  delete: DeleteContentOrMedia;
  isAccessTokenRevoked: IsAccessTokenRevoked;
  undelete?: Undelete;
  update: Update;
}
