import { requestContext } from "@fastify/request-context";
import { InvalidRequestError } from "@jackdbd/oauth2-error-responses";
import { rfc3339 } from "@jackdbd/oauth2-tokens";
import type { Jf2 } from "@paulrobertlloyd/mf2tojf2";
import type { RouteHandler, RouteGenericInterface } from "fastify";
import { mf2tTojf2 } from "../mf2-to-jf2.js";
import { normalizeJf2 } from "../normalize-jf2.js";
import { isMf2 } from "../schemas/index.js";
import type {
  Action,
  MicropubPostConfig,
  PostRequestBody,
} from "../schemas/index.js";

interface PostRouteGeneric extends RouteGenericInterface {
  Body: PostRequestBody;
}

// We should return a Location response header if we can't (or don't want to)
// publish the post right away.
// https://github.com/aaronpk/Quill/blob/dfb8c03a85318c9e670b8dacddb210025163501e/views/new-post.php#L406

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
    // delete: deleteContent,
    includeErrorDescription: include_error_description,
    logPrefix: log_prefix,
    // undelete,
    // update,
  } = config;

  // const multipartRequestBody = defMultipartRequestBody({
  //   media_endpoint,
  //   micropub_endpoint,
  //   prefix: `${log_prefix}multipart `
  // })

  const micropubPost: RouteHandler<PostRouteGeneric> = async (
    request,
    reply
  ) => {
    console.log("=== request.body ===", request.body);

    // let request_body: PostRequestBody;
    // if (request.isMultipart()) {
    //   console.log("=== multipart request ===");
    //   request_body = await multipartRequestBody(request);
    // } else {
    //   request_body = request.body;
    // }

    let jf2: Jf2;
    if (isMf2(request.body)) {
      const { error, value } = await mf2tTojf2({ items: request.body.items });

      if (error) {
        const error_description = error.message;
        request.log.error(
          { request_body: request.body },
          `${log_prefix}${error_description}`
        );
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
      } = request.body as Jf2;
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
    requestContext.set("jf2", jf2);

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
    //   request.log.warn(`${log_prefix}${error_description}`);
    //   const err = new InsufficientScopeError({ error_description });
    //   return reply
    //     .code(err.statusCode)
    //     .send(err.payload({ include_error_description }));
    // }

    if (url) {
      switch (action) {
        // TODO: handle delete, undelete, update
        default: {
          const error_description = `Action '${action}' is not supported by this Micropub server.`;
          request.log.error(
            { action, jf2 },
            `${log_prefix}${error_description}`
          );
          const err = new InvalidRequestError({ error_description });
          return reply
            .code(err.statusCode)
            .send(err.payload({ include_error_description }));
        }
      }
    }

    const validate = request.getValidationFunction("body");
    validate(request.body);
    console.log("=== validate.errors ===", validate.errors);

    // If `url` is undefined, it's because action is 'create' (i.e. we need to
    // create the Micropub post)
    // TODO: handle card, cite, entry, event
    // create should return the published `location` URL in the response.
    switch (jf2.h) {
      case "card": {
        console.log("=== handle create card ===", jf2);
        const result = await create(jf2);
        console.log("=== after create card ===", result);
        break;
      }
      case "cite": {
        console.log("=== handle create cite ===", jf2);
        const result = await create(jf2);
        console.log("=== after create cite ===", result);
        break;
      }
      case "entry": {
        console.log("=== handle create entry ===", jf2);
        const result = await create(jf2);
        console.log("=== after create entry ===", result);
        break;
      }
      case "event": {
        console.log("=== handle create event ===", jf2);
        const result = await create(jf2);
        console.log("=== after create event ===", result);
        break;
      }
      default: {
        const error_description = `Post h=${jf2.h} is not supported by this Micropub server.`;
        request.log.error({ action, jf2 }, `${log_prefix}${error_description}`);
        const err = new InvalidRequestError({ error_description });
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }));
      }
    }

    return reply.code(200).send({ ok: true });
  };

  return micropubPost;
};
