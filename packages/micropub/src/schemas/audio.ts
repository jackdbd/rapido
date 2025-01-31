import { Static, Type } from "@sinclair/typebox";
import { u_url } from "@jackdbd/microformats2";

// To upload one or more audio files, clients must make a multipart request.
// https://micropub.spec.indieweb.org/#uploading-files
// https://micropub.spec.indieweb.org/#posting-files

export const audio = Type.Union(
  [
    Type.Unsafe<Static<typeof u_url>>(Type.Ref(u_url.$id!)),
    Type.Array(Type.Unsafe<Static<typeof u_url>>(Type.Ref(u_url.$id!))),
  ],
  {
    $id: "micropub-audio",
    title: "Micropub audio",
  }
);

export type Audio = Static<typeof audio>;
