import { requestContext } from '@fastify/request-context'
import { rfc3339 } from '@jackdbd/indieauth'
import { isMF2, isParsedMF2, type ParsedMF2 } from '@jackdbd/microformats2'
import { InvalidRequestError } from '@jackdbd/oauth2-error-responses'
import type { RouteHandler, RouteGenericInterface } from 'fastify'
import {
  mf2tTojf2,
  normalizeJf2,
  isMpUrlencodedRequestBody,
  jf2WithNoSensitiveProps,
  jf2WithNoUselessProps
} from '@jackdbd/micropub'
import { jf2 as jf2_schema } from '@jackdbd/micropub/schemas'
import type {
  Action,
  JF2_JSON,
  JF2_Urlencoded_Or_Multipart,
  UpdatePatch
} from '@jackdbd/micropub/schemas'
import { conformResult } from '@jackdbd/schema-validators'
import type { MicropubPostConfig, PostRequestBody } from '../schemas/index.js'
import {
  defProcessMultipartRequest,
  type UploadedMedia
} from './micropub-post-multipart.js'

declare module '@fastify/request-context' {
  interface RequestContextData {
    action?: string
    jf2?: JF2_JSON
    post_type?: string
  }
}

interface PostRouteGeneric extends RouteGenericInterface {
  Body: PostRequestBody
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
    ajv,
    createPost,
    deletePost,
    jf2ToLocation,
    logPrefix,
    mediaEndpoint,
    micropubEndpoint,
    undeletePost,
    updatePost
  } = config

  const processMultipartRequest = defProcessMultipartRequest({
    mediaEndpoint,
    micropubEndpoint,
    logPrefix: `${logPrefix}multipart `
  })

  const micropubPost: RouteHandler<PostRouteGeneric> = async (
    request,
    reply
  ) => {
    // console.log('=== request.body (stringified) ===')
    // console.log(JSON.stringify(request.body, null, 2))

    let uploaded_media: UploadedMedia[] = []
    let jf2: JF2_JSON
    let request_body: PostRequestBody
    if (request.isMultipart()) {
      const result = await processMultipartRequest(request)
      request_body = result.jf2 as PostRequestBody
      uploaded_media = result.uploaded
    } else {
      request_body = request.body
    }

    if (isMF2(request_body) || isParsedMF2(request_body)) {
      let items: ParsedMF2[]
      if (isMF2(request_body)) {
        request.log.debug(`${logPrefix}convert MF2 => JF2`)
        items = request_body.items
      } else {
        request.log.debug(`${logPrefix}convert MF2 JSON => JF2`)
        items = [request_body]
      }
      const { error, value } = await mf2tTojf2({ items })

      if (error) {
        throw new InvalidRequestError({ error_description: error.message })
      } else {
        jf2 = value
      }
    } else if (
      isMpUrlencodedRequestBody(request_body, request.headers['content-type'])
    ) {
      // If we received an urlencoded request, we need to normalize properties
      // like syndicate-to[][0], syndicate-to[][1] into actual JS arrays.
      // For example, this occurs when uploading more than one file to the Media
      // endpoint. In that case we might have audio[], video[], and photo[].
      request.log.debug(`${logPrefix}convert urlencoded request => JF2`)
      const h = (request_body as JF2_Urlencoded_Or_Multipart).h || 'entry'
      jf2 = normalizeJf2({ ...request_body, h })
    } else {
      // Even when request_body is empty, it's still a valid JF2. See here:
      // https://validator.jf2.rocks/
      jf2 = request_body as JF2_JSON

      // I think that for the following defaults using a logical OR is more
      // appropriate than using the nullish coalescing operator, because
      // whenever we find an empty string, we should replace it with the default
      // value.

      // If no type is specified, the default type [h-entry] SHOULD be used.
      // https://micropub.spec.indieweb.org/#create
      jf2.type = jf2.type || 'entry'
    }

    // The default action is to create posts (I couldn't find it in the Micropub
    // specs though).
    jf2.action = jf2.action || 'create'

    // I can't find a link to the microformats2/jf2/micropub spec section
    // that explains which data formats should be accepted.
    jf2.date = jf2.date || rfc3339()

    jf2.visibility = jf2.visibility || 'public'

    // We store the jf2 object in the request context, so if an exception is
    // thrown, we can retrieve the jf2 object in the error handler (and maybe
    // add it to the OAuth2 error response).
    // TODO: decide about this:
    // Security consideration: it's probably safer to save jf2 to requestContext
    // AFTER having called jf2SafeToStore.
    if (requestContext) {
      requestContext.set('jf2', jf2)
      request.log.debug(`${logPrefix}set jf2 in requestContext`)
    } else {
      request.log.warn(`${logPrefix}cannot set in requestContext: jf2`)
    }

    // We want to make sure no sensitive property end up in the content store
    jf2 = jf2WithNoSensitiveProps(jf2)

    // We also don't want to store a few other non-sensitive properties. They
    // are of no use in the content store.
    const action = jf2.action as Action
    const post_type = jf2.type
    const mp_slug = jf2['mp-slug']
    jf2 = jf2WithNoUselessProps(jf2)

    // TODO: maybe verify scope in a hook, before entering the route handler.
    // But we do need to parse the request body to know the action, and since
    // the request body can be MF2, JF2, etc, it's probably easier to validate
    // the scope here.
    // if (!hasScope(request, action)) {
    //   const error_description = `Action '${action}' not allowed, since access token has no scope '${action}'.`;
    //   request.log.warn(`${logPrefix}${error_description}`);
    //   throw new InsufficientScopeError({ error_description });

    // The create/update/delete/undelete functions are provided by the user and
    // might throw exceptions. We can either try/catch them here, or let them
    // bubble up and catch them in the error handler set by this plugin with
    // fastify.setErrorHandler. I don't think catching the exceptions here adds
    // much value. It seems better to just handle them in ther error handler.

    if (jf2.url) {
      if (typeof jf2.url !== 'string') {
        const error_description = `JF2 object has an invalid 'url' property: ${jf2.url}`
        throw new InvalidRequestError({ error_description })
      }

      switch (action) {
        case 'delete': {
          // The server MUST respond to successful delete and undelete requests
          // with HTTP 200, 201 or 204. If the undelete operation (I think also
          // the delete operation in case of a soft delete) caused the URL of
          // the post to change, the server MUST respond with HTTP 201 and
          // include the new URL in the HTTP Location header.
          // https://micropub.spec.indieweb.org/#delete
          request.log.debug(`${logPrefix}trying to delete ${jf2.url}`)
          await deletePost(jf2.url)
          request.log.debug(`${logPrefix}deleted ${jf2.url}`)
          return reply.code(200).send({ message: `Deleted ${jf2.url}` })
        }

        case 'undelete': {
          if (!undeletePost) {
            const error_description = `Action 'undelete' not supported by this Micropub server.`
            throw new InvalidRequestError({ error_description })
          } else {
            request.log.debug(`${logPrefix}trying to undelete ${jf2.url}`)
            await undeletePost(jf2.url)
            request.log.debug(`${logPrefix}undeleted ${jf2.url}`)
            return reply.code(200).send({ message: `Undeleted ${jf2.url}` })
          }
        }

        case 'update': {
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
          const { url, ...rest } = jf2
          const patch = rest as UpdatePatch
          request.log.debug(`${logPrefix}trying to update ${jf2.url}`)
          await updatePost(url, patch)
          request.log.debug(`${logPrefix}updated ${jf2.url}`)
          return reply.code(200).send({ message: `Updated ${url}`, patch })
        }

        default: {
          if (request.requestContext) {
            request.requestContext.set('action', action)
            request.requestContext.set('jf2', jf2)
            request.requestContext.set('post_type', post_type)
          } else {
            request.log.warn(
              `${logPrefix}cannot set in requestContext: action, jf2, post_type`
            )
          }
          const error_description = `Action '${action}' is not supported by this Micropub server.`
          throw new InvalidRequestError({ error_description })
        }
      }
    } else {
      if (action !== 'create') {
        if (request.requestContext) {
          request.requestContext.set('action', action)
          request.requestContext.set('jf2', jf2)
          request.requestContext.set('post_type', post_type)
        } else {
          request.log.warn(
            `${logPrefix}cannot set in requestContext: action, jf2, post_type`
          )
        }
        const error_description = `JF2 has no 'url' property and the 'action' property is not 'create'. Action '${action}' is not supported by this Micropub server.`
        throw new InvalidRequestError({ error_description })
      }
    }

    // When the post is created, the Micropub endpoint MUST return either an
    // HTTP 201 Created status code or HTTP 202 Accepted code, and MUST return a
    // Location header indicating the URL of the created post.
    // If the endpoint chooses to process the request asynchronously rather than
    // creating and storing the post immediately, it MUST return an HTTP 202
    // Accepted status code, and MUST also return the Location header.
    // https://micropub.spec.indieweb.org/#create

    // TODO: how to know the URL of the created post?
    // I think need a user-provided function which is specular to
    // websiteUrlToStorageLocation. Something like storageLocationToWebsiteUrl.

    // We have already returned a response for delete/undelete/update, so this
    // validate function validates a micropub post that we want to CREATE.
    // const validate = request.getValidationFunction('body')
    // If we did not set a schema for the body, validate will be undefined.
    // if (validate) {
    //   validate(request_body)
    //   console.log('=== validate.errors ===', validate.errors)
    // }

    const { error: conform_error } = conformResult(
      {
        ajv,
        schema: jf2_schema,
        data: jf2
      },
      { basePath: 'jf2' }
    )

    if (conform_error) {
      throw conform_error
    }

    // This code is the same for card/cite/entry/event the different post types.
    // But we might want to validate each JF2 object differently and return a
    // different response payload.
    const loc = jf2ToLocation({
      ...jf2,
      'mp-slug': mp_slug,
      type: post_type
    })

    // await create(jf2)

    const message = `Stored post at ${loc.store}. Will be published at ${loc.website}`

    const payload =
      uploaded_media.length > 0 ? { message, uploaded_media } : { message }

    switch (post_type) {
      case 'card': {
        // TODO: validate card schema
        await createPost(jf2)
        return reply.code(201).header('Location', loc.website).send(payload)
      }

      case 'cite': {
        // TODO: validate cite schema
        await createPost(jf2)
        return reply.code(201).header('Location', loc.website).send(payload)
      }

      case 'entry': {
        // TODO: validate entry schema
        await createPost(jf2)
        return reply.code(201).header('Location', loc.website).send(payload)
      }

      case 'event': {
        // TODO: validate event schema
        await createPost(jf2)
        return reply.code(201).header('Location', loc.website).send(payload)
      }

      default: {
        if (request.requestContext) {
          request.requestContext.set('action', action)
          request.requestContext.set('jf2', jf2)
          request.requestContext.set('post_type', post_type)
        } else {
          request.log.warn(
            `${logPrefix}cannot set in requestContext: action, jf2, post_type`
          )
        }
        const error_description = `Post type=${post_type} is not supported by this Micropub server.`
        throw new InvalidRequestError({ error_description })
      }
    }
  }

  return micropubPost
}
