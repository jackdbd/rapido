import { issuer } from "@jackdbd/indieauth";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT } from "../constants.js";
import { ajv } from "./common.js";
import {
  retrieveAuthorizationCode,
  onAuthorizationCodeVerified,
  onUserApprovedRequest,
} from "./user-provided-functions.js";
import type {
  RetrieveAuthorizationCode,
  OnAuthorizationCodeVerified,
  OnUserApprovedRequest,
} from "./user-provided-functions.js";

const include_error_description = Type.Boolean({
  description: `Whether to include an \`error_description\` property in all error responses. This is meant to assist the client developer in understanding the error. This is NOT meant to be shown to the end user.`,
  default: DEFAULT.INCLUDE_ERROR_DESCRIPTION,
});

const report_all_ajv_errors = Type.Boolean({
  description: "Whether to report all AJV validation errors.",
  title: "report all AJV errors",
  default: DEFAULT.REPORT_ALL_AJV_ERRORS,
});

const filepath = Type.String({ minLength: 1 });

export const options = Type.Object(
  {
    /**
     * AJV instance, for validation.
     */
    ajv: Type.Optional(ajv),

    /**
     * Human-readable expiration time for the authorization code. It will be
     * shown in the consent screen.
     *
     * @example '60 seconds'
     */
    authorizationCodeExpiration: Type.Optional(
      Type.String({
        default: DEFAULT.AUTHORIZATION_CODE_EXPIRATION,
        minLength: 1,
      })
    ),

    components: Type.Optional(
      Type.Object(
        {
          "consent-form": Type.Optional(filepath),
          "scope-list": Type.Optional(filepath),
          "the-footer": Type.Optional(filepath),
          "the-header": Type.Optional(filepath),
        },
        { description: "Filepaths to WebC components" }
      )
    ),

    redirectPathOnSubmit: Type.Optional(
      Type.String({ minLength: 1, default: DEFAULT.REDIRECT_PATH_ON_SUBMIT })
    ),

    /**
     * Whether to include an \`error_description\` property in all error responses.
     *
     * @see [Error Response - IndieAuth](https://micropub.spec.indieweb.org/#error-response)
     */
    includeErrorDescription: Type.Optional(include_error_description),

    /**
     * Issuer identifier. This is optional in OAuth 2.0 servers, but required in
     * IndieAuth servers.
     *
     * See also the `authorization_response_iss_parameter_supported` parameter in
     * [IndieAuth Server Metadata](https://indieauth.spec.indieweb.org/#indieauth-server-metadata).
     */
    issuer: Type.Optional(issuer),

    logPrefix: Type.Optional(Type.String({ default: DEFAULT.LOG_PREFIX })),

    /**
     * Handler that runs after the authorization code has been verified.
     * You should use this handler to inform your storage backend that the
     * authorization code has been used.
     */
    onAuthorizationCodeVerified,

    /**
     * Handler executed after the user approves the authorization request on the
     * consent screen. It should be used to persist the authorization code
     * generated by the authorization endpoint into your storage backend.
     */
    onUserApprovedRequest,

    /**
     * Whether to include all AJV errors when validation fails.
     */
    reportAllAjvErrors: Type.Optional(report_all_ajv_errors),

    /**
     * Function that retrieves an authorization code from some storage.
     */
    retrieveAuthorizationCode,

    templates: Type.Optional(
      Type.Array(filepath, {
        description: "Filepaths to WebC templates",
        minItems: 1,
      })
    ),
  },
  {
    $id: "fastify-authorization-endpoint-options",
    description: "Options for the Fastify authorization-endpoint plugin",
    title: "Authorization Endpoint Options",
  }
);

export interface Options extends Static<typeof options> {
  retrieveAuthorizationCode: RetrieveAuthorizationCode;
  onAuthorizationCodeVerified: OnAuthorizationCodeVerified;
  onUserApprovedRequest: OnUserApprovedRequest;
}
