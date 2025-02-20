import { u_video } from '@jackdbd/microformats2'
import { Static, Type } from '@sinclair/typebox'

// To upload one or more video files, clients must make a multipart request.
// https://micropub.spec.indieweb.org/#uploading-files
// https://micropub.spec.indieweb.org/#posting-files

export const video = Type.Union(
  [
    Type.Unsafe<Static<typeof u_video>>(Type.Ref(u_video.$id!)),
    Type.Array(Type.Unsafe<Static<typeof u_video>>(Type.Ref(u_video.$id!)))
  ],
  {
    $id: 'micropub-video',
    title: 'Micropub video'
  }
)

export type Video = Static<typeof video>
