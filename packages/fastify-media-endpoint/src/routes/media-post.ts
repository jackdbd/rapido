import type { MultipartFile, MultipartValue } from '@fastify/multipart'
import type { Action } from '@jackdbd/micropub'
import type {
  DeletePost,
  UploadMedia
} from '@jackdbd/micropub/schemas/user-provided-functions'
import {
  InvalidRequestError,
  ServerError
} from '@jackdbd/oauth2-error-responses'
import type { RouteHandler } from 'fastify'

interface Config {
  delete: DeletePost
  include_error_description: boolean
  upload: UploadMedia
}

/**
 * The role of the Media Endpoint is exclusively to handle file uploads and
 * return a URL that can be used in a subsequent Micropub request.
 *
 * To upload a file to the Media Endpoint, the client sends a
 * `multipart/form-data` request with one part named `file`.
 *
 * The Media Endpoint processes the file upload, storing it in whatever backend
 * it wishes, and generates a URL to the file. The URL SHOULD be unguessable,
 * such as using a UUID in the path.
 * If the request is successful, the endpoint MUST return the URL to the file
 * that was created in the HTTP Location header, and respond with HTTP 201
 * Created. The response body is left undefined.
 *
 * @see [Media Endpoint](https://micropub.spec.indieweb.org/#media-endpoint)
 * @see [Request to the Media Endpoint](https://micropub.spec.indieweb.org/#request)
 * @see [Response from the Media Endpoint](https://www.w3.org/TR/micropub/#response-3)
 * @see [Uploading Files](https://micropub.spec.indieweb.org/#uploading-files)
 */
export const defMediaPost = (config: Config) => {
  const { delete: deleteMedia, include_error_description, upload } = config

  // TODO: refactr this
  // const errorIfActionNotAllowed = defErrorIfActionNotAllowed();

  const mediaPost: RouteHandler = async (request, reply) => {
    if (!request.isMultipart()) {
      const action = (request.body as any).action as Action

      if (action !== 'delete') {
        const error_description = `Action '${action}' is not supported by this media endpoint.`
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }

      // We should also check the presence of a 'media' scope in the access token
      // claims.
      // const scope_error = errorIfActionNotAllowed(request, action)
      // if (scope_error) {
      //   return reply
      //     .code(scope_error.statusCode)
      //     .send(scope_error.payload({ include_error_description }))
      // }

      const url = (request.body as any).url as string

      try {
        const value = await deleteMedia(url)
        request.log.warn(value, '====== deleteMedia return value ======')
        // const code = 200
        // const url = result.value.url || ''
        // const summary = `${url} deleted`
        // const payload = result.value.payload
        return reply.code(200).send({ message: `${url} deleted` })
      } catch (ex: any) {
        const original = ex.message
        const error_description = `Cannot delete ${url} from media store: ${original}.`
        const err = new ServerError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    } else {
      let data: MultipartFile | undefined
      try {
        data = await request.file()
        request.log.warn({ data }, '====== request.file return value ======')
      } catch (ex: any) {
        const error_description = ex.message
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }

      if (!data) {
        const error_description = 'Multi-part request has no file.'
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }

      let filename: string
      if (data.filename) {
        filename = data.filename
      } else if (data.fields.filename) {
        const value = data.fields.filename as MultipartValue<string>
        filename = value.value
      } else {
        const error_description = `Request has no field 'filename'.`
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }

      const contentType = data.mimetype

      let body: Buffer
      try {
        body = await data.toBuffer()
      } catch (ex: any) {
        const error_description = ex.message
        // I am not sure it's actually the client's fault if we can't obtain the
        // buffer from the multipart request.
        const err = new InvalidRequestError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }

      try {
        const value = await upload({ body, contentType, filename })
        request.log.warn(value, '====== upload return value ======')
        const code = 202 // or 201
        const url = value.url
        reply.header('Location', url)
        return reply.code(code).send({ message: `File uploaded to ${url}` })
      } catch (ex: any) {
        const original = ex.message
        const error_description = `Cannot upload file ${filename} to media store: ${original}`
        const err = new ServerError({ error_description })
        return reply
          .code(err.statusCode)
          .send(err.payload({ include_error_description }))
      }
    }
  }

  return mediaPost
}
