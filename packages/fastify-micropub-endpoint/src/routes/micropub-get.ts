import { InvalidRequestError } from "@jackdbd/oauth2-error-responses";
import type { RouteHandler } from "fastify";
import type { MicropubGetConfig } from "../schemas/route-micropub-get.js";

/**
 * Configuration of this Micropub endpoint.
 *
 * @see [Querying - Micropub](https://micropub.spec.indieweb.org/#querying)
 */
export const defMicropubGet = (config: MicropubGetConfig) => {
  const {
    includeErrorDescription: include_error_description,
    mediaEndpoint,
    syndicateTo,
  } = config;

  const micropubGet: RouteHandler = (request, reply) => {
    const basePath = "micropub-get-request-querystring";

    // If we reached this handler, I guess Fastify has already validated the
    // querystring against the schema.
    const validate = request.getValidationFunction("querystring");
    validate(request.query);

    // In alternative:
    // const { error, value } = conformResult(
    //   { ajv, schema: micropub_request_querystring, data: request.query },
    //   { basePath }
    // );

    if (validate.errors) {
      const errors = validate.errors.map((ve) => {
        return `${ve.message} (basePath: ${basePath}, instancePath: ${ve.instancePath}, schemaPath: ${ve.schemaPath})`;
      });
      const err = new InvalidRequestError({
        error_description: errors.join("; "),
      });

      return reply
        .code(err.statusCode)
        .send(err.payload({ include_error_description }));
    }

    return reply.code(200).send({
      "media-endpoint": mediaEndpoint,
      "syndicate-to": syndicateTo,
    });
  };

  return micropubGet;
};
