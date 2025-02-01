import { Static, Type } from "@sinclair/typebox";
import { jti, url } from "./common.js";

export const deleteContentOrMedia = Type.Function(
  [url],
  Type.Promise(Type.Any()),
  {
    title: "delete",
    description:
      "[Deletes](https://micropub.spec.indieweb.org/#delete) a file from the Micropub server.",
  }
);

/**
 * Deletes a post or media from the Micropub server.
 *
 * @see [Delete - Micropub](https://micropub.spec.indieweb.org/#delete)
 */
export type DeleteContentOrMedia = Static<typeof deleteContentOrMedia>;

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export const isAccessTokenRevoked = Type.Function(
  [jti],
  Type.Promise(Type.Boolean()),
  {
    title: "isAccessTokenRevoked",
    description: `Predicate function that returns true if a jti (JSON Web Token ID) is revoked.`,
  }
);

/**
 * Predicate function that returns true if a jti (JSON Web Token ID) is revoked.
 * This function will most likely need to access a storage backend in order to
 * come up with an answer.
 */
export type IsAccessTokenRevoked = Static<typeof isAccessTokenRevoked>;

export const upload_config = Type.Object({
  body: Type.Any({ description: "The file to upload." }),
  contentType: Type.String({
    description:
      "Content-Type of the file being uploaded to the Media endpoint.",
  }),
  filename: Type.String({
    description:
      "Name of the file being uploaded to the Media endpoint. The Media Endpoint MAY ignore the suggested filename that the client sends.",
  }),
});

export interface UploadConfig extends Static<typeof upload_config> {
  body: Buffer;
}

export const uploadMediaReturnValue = Type.Object({
  url: Type.String({
    description: "URL of the uploaded file.",
    format: "uri",
  }),
});

export type UploadMediaReturnValue = Static<typeof uploadMediaReturnValue>;

export const uploadMedia = Type.Function(
  [upload_config],
  Type.Promise(uploadMediaReturnValue),
  {
    title: "upload",
    description:
      "[Uploads a file](https://micropub.spec.indieweb.org/#uploading-files) to the Micropub server.",
  }
);

export type UploadMedia = Static<typeof uploadMedia>;
