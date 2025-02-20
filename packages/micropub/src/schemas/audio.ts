import { u_audio } from '@jackdbd/microformats2'
import { Static, Type } from '@sinclair/typebox'

// To upload one or more audio files, clients must make a multipart request.
// https://micropub.spec.indieweb.org/#uploading-files
// https://micropub.spec.indieweb.org/#posting-files

export const audio = Type.Union(
  [
    Type.Unsafe<Static<typeof u_audio>>(Type.Ref(u_audio.$id!)),
    Type.Array(Type.Unsafe<Static<typeof u_audio>>(Type.Ref(u_audio.$id!)))
  ],
  {
    $id: 'micropub-audio',
    title: 'Micropub audio'
  }
)

export type Audio = Static<typeof audio>
