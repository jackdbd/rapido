import { requestContext } from "@fastify/request-context";
import { InvalidRequestError } from "@jackdbd/oauth2-error-responses";
import { rfc3339 } from "@jackdbd/oauth2-tokens";
import type { Jf2 } from "@paulrobertlloyd/mf2tojf2";
import type { RouteHandler, RouteGenericInterface } from "fastify";
import { mf2tTojf2, normalizeJf2 } from "@jackdbd/micropub";
import type { Action } from "@jackdbd/micropub";
import { isMf2 } from "../schemas/index.js";
import type {
  MicropubPostConfig,
  PostRequestBody,
  UpdatePatch,
} from "../schemas/index.js";
import { defMultipartRequestBody } from "./micropub-post-multipart.js";

declare module "@fastify/request-context" {
  interface RequestContextData {
    jf2?: Jf2;
  }
}

interface PostRouteGeneric extends RouteGenericInterface {
  Body: PostRequestBody;
}

/**
 * When a user creates an entry (e.g. a note) that contains one or more files
 * (e.g. one photo), different Micropub clients might behave differently.
 * Some Micropub clients might upload the files to the Media endpoint and the
 * other microformats2 fields to the Micropub endpoint.
 * Some other Micropub clients might make a single, multi-part request to just
 * the Micropub endpoint.
 *
 * From the [Quill documentation](https://quill.p3k.io/docs/note).
 * If your Micropub server supports a Media Endpoint, then at the time you
 * select a photo, Quill uploads the file to your Media Endpoint and shows a
 * preview in the interface. The image URL will be sent as a string in the
 * request.
 *
 * If your Micropub server does not support a Media Endpoint, then when you
 * add an image, it is not uploaded until you click "post", and then is sent
 * to your Micropub endpoint as a file.
 *
 * A request containing files and fields coming from an API client like Postman
 * or Bruno will be a single, multi-part request to the Micropub endpoint.
 *
 * From the [Micropub spec](https://micropub.spec.indieweb.org/#posting-files).
 * When a Micropub request includes a file, the entire request is sent in
 * `multipart/form-data encoding`, and the file is named according to the
 * property it corresponds with in the vocabulary, either audio, video or photo.
 *
 * @see https://indieweb.org/Micropub#Handling_a_micropub_request
 */
export const defMicropubPost = (config: MicropubPostConfig) => {
  const {
    create,
    delete: deleteContent,
    includeErrorDescription: include_error_description,
    logPrefix,
    mediaEndpoint,
    micropubEndpoint,
    undelete,
    update,
  } = config;

  const multipartRequestBody = defMultipartRequestBody({
    mediaEndpoint,
    micropubEndpoint,
    logPrefix: `${logPrefix}multipart `,
  });

  const micropubPost: RouteHandler<PostRouteGeneric> = async (
    request,
    reply
  ) => {
    console.log("=== request.body ===", request.body);

    let request_body: PostRequestBody;
    if (request.isMultipart()) {
      console.log("=== multipart request ===");
      request_body = await multipartRequestBody(request);
    } else {
      request_body = request.body;
    }

    let jf2: Jf2;
    if (isMf2(request_body)) {
      const { error, value } = await mf2tTojf2({ items: request_body.items });

      if (error) {
        const error_description = error.message;
        request.log.error({ request_body }, `${logPrefix}${error_description}`);
        const err = new InvalidRequestError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      } else {
        // We could end up with an access_token in the request body. It happed
        // to me when I made a request from Quill. But I don't think it's
        // Quill's fault. I think it's due to how the formbody plugin works.
        const {
          access_token: _,
          action,
          h,
          type: _type,
          visibility,
          ...rest
        } = value;
        jf2 = {
          ...rest,
          // The default action is to create posts (I couldn't find it in the
          // Micropub specs though).
          action: action || "create",
          date: rfc3339(),
          // If no type is specified (using `h`), the default type [h-entry]
          // SHOULD be used.
          // https://micropub.spec.indieweb.org/#create
          h: h || "entry",
          visibility: visibility || "public",
        };
      }
    } else {
      const {
        access_token: _,
        action,
        h,
        type: _type,
        visibility,
        ...rest
      } = request_body as Jf2;
      jf2 = {
        ...rest,
        action: action || "create",
        date: rfc3339(),
        h: h || "entry",
        visibility: visibility || "public",
      };
    }

    // If the Micropub client sent us a urlencoded request, we need to normalize
    // fields like syndicate-to[][0], syndicate-to[][1] into actual JS arrays.
    // Same thing if we uploaded more than one file to the Media endpoint. In
    // that case we might have audio[], video[], and photo[] fields.
    jf2 = normalizeJf2(jf2);

    // We store the jf2 object in the request context, so if there is a server
    // error we can access it in the error handler.
    if (requestContext) {
      requestContext.set("jf2", jf2);
      request.log.debug(`${logPrefix}set jf2 (normalized) in requestContext`);
    } else {
      request.log.warn(
        `${logPrefix}cannot set jf2 in requestContext (requestContext is not available)`
      );
    }

    // The server MUST respond to successful delete and undelete requests with
    // HTTP 200, 201 or 204. If the undelete operation caused the URL of the
    // post to change, the server MUST respond with HTTP 201 and include the new
    // URL in the HTTP Location header.
    // https://micropub.spec.indieweb.org/#delete
    const action = jf2.action as Action;
    const url = jf2.url;

    // TODO: do this in a hook, before entering the route handler.
    // if (!hasScope(request, action)) {
    //   const error_description = `Action '${action}' not allowed, since access token has no scope '${action}'.`;
    //   request.log.warn(`${logPrefix}${error_description}`);
    //   const err = new InsufficientScopeError({ error_description });
    //   return reply
    //     .code(err.statusCode)
    //     .send(err.payload({ include_error_description }));
    // }

    // The create/update/delete/undelete functions are provided by the user and
    // might throw exceptions. We can either try/catch them here, or let them
    // bubble up and catch them in the error handler set by this plugin with
    // fastify.setErrorHandler. I don't think catching the exceptions here adds
    // much value. It seems better to just handle them in ther error handler.

    if (url) {
      switch (action) {
        case "delete": {
          // The server MUST respond to successful delete and undelete requests
          // with HTTP 200, 201 or 204.
          // https://micropub.spec.indieweb.org/#delete
          await deleteContent(url);
          return reply.code(200).send({ message: `Deleted ${url}` });
        }

        case "undelete": {
          if (!undelete) {
            const error_description = `Action 'undelete' not supported by this Micropub server.`;
            const err = new InvalidRequestError({ error_description });
            return reply
              .code(err.statusCode)
              .send(err.payload({ include_error_description }));
          } else {
            await undelete(url);
            return reply.code(200).send({ message: `Undeleted ${url}` });
          }
        }

        case "update": {
          // The server MUST respond to successful update requests with HTTP 200,
          // 201 or 204.
          // If the update operation caused the URL of the post to change, the
          // server MUST respond with HTTP 201 and include the new URL in the
          // HTTP Location header. Otherwise, the server MUST respond with 200
          // or 204, depending on whether the response body has content.
          // No body is required in the response, but the response MAY contain a
          // JSON object describing the changes that were made.
          // https://micropub.spec.indieweb.org/#update
          // TODO: return correct response upon successful update operation.
          const { action: _action, h: _h, type: _type, ...rest } = jf2;
          const patch = rest as UpdatePatch;
          await update(url, patch);
          return reply.code(200).send({ message: `Updated ${url}`, patch });
        }

        default: {
          const error_description = `Action '${action}' is not supported by this Micropub server.`;
          request.log.error(
            { action, jf2 },
            `${logPrefix}${error_description}`
          );
          const err = new InvalidRequestError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        }
      }
    }

    const validate = request.getValidationFunction("body");
    validate(request_body);
    console.log("=== validate.errors ===", validate.errors);

    // If `url` is undefined, it's because action is 'create' (i.e. we need to
    // create the Micropub post).
    // When the post is created, the Micropub endpoint MUST return either an
    // HTTP 201 Created status code or HTTP 202 Accepted code, and MUST return a
    // Location header indicating the URL of the created post.
    // If the endpoint chooses to process the request asynchronously rather than
    // creating and storing the post immediately, it MUST return an HTTP 202
    // Accepted status code, and MUST also return the Location header.
    // https://micropub.spec.indieweb.org/#create
    // TODO: how to know the URL of the created post?
    switch (jf2.h) {
      case "card": {
        const location = "https://example.com/cards";
        await create(jf2);
        return reply
          .code(201)
          .header("Location", location)
          .send({ message: `Created card at url ${location}` });
      }

      case "cite": {
        const location = "https://example.com/cites";
        await create(jf2);
        return reply
          .code(201)
          .header("Location", location)
          .send({ message: `Created cite at url ${location}` });
      }

      case "entry": {
        const location = "https://example.com/entries";
        await create(jf2);
        return reply
          .code(201)
          .header("Location", location)
          .send({ message: `Created entry at url ${location}` });
      }

      case "event": {
        const location = "https://example.com/events";
        await create(jf2);
        return reply
          .code(201)
          .header("Location", location)
          .send({ message: `Created event at url ${location}` });
      }

      default: {
        const error_description = `Post h=${jf2.h} is not supported by this Micropub server.`;
        request.log.error({ action, jf2 }, `${logPrefix}${error_description}`);
        const err = new InvalidRequestError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      }
    }
  };

  return micropubPost;
};
