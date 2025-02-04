import { type Static, Type } from '@sinclair/typebox'
import { h_entry } from '@jackdbd/microformats2'
import { date_time } from './date-time.js'
import {
  access_token,
  action,
  mp_limit,
  mp_post_status,
  mp_slug,
  mp_syndicate_to,
  mp_visibility
} from './micropub-reserved-properties.js'
import { audio } from './audio.js'
import { photo } from './photo.js'
import { video } from './video.js'

export const mp_entry = Type.Object(
  {
    ...h_entry.properties,

    access_token: Type.Optional(
      Type.Unsafe<Static<typeof access_token>>(Type.Ref(access_token.$id!))
    ),

    action: Type.Optional(
      Type.Unsafe<Static<typeof action>>(Type.Ref(action.$id!))
    ),

    audio: Type.Optional(
      Type.Unsafe<Static<typeof audio>>(Type.Ref(audio.$id!))
    ),

    h: Type.Optional(Type.Literal('entry', { default: 'entry' })),

    limit: Type.Optional(
      Type.Unsafe<Static<typeof mp_limit>>(Type.Ref(mp_limit.$id!))
    ),

    'mp-slug': Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),

    'mp-syndicate-to': Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    ),

    photo: Type.Optional(
      Type.Unsafe<Static<typeof photo>>(Type.Ref(photo.$id!))
    ),

    post_status: Type.Optional(
      Type.Unsafe<Static<typeof mp_post_status>>(Type.Ref(mp_post_status.$id!))
    ),

    published: Type.Optional(
      Type.Unsafe<Static<typeof date_time>>(Type.Ref(date_time.$id!))
    ),

    // Since in Micropub we use `h` to indicate the type of the object, we don't
    // need `type` to be present. But if it is, it must be 'entry'.
    type: Type.Optional(Type.Literal('entry')),

    updated: Type.Optional(
      Type.Unsafe<Static<typeof date_time>>(Type.Ref(date_time.$id!))
    ),

    video: Type.Optional(
      Type.Unsafe<Static<typeof video>>(Type.Ref(video.$id!))
    ),

    visibility: Type.Optional(
      Type.Unsafe<Static<typeof mp_visibility>>(Type.Ref(mp_visibility.$id!))
    )
  },
  { $id: 'micropub-entry', title: 'Micropub h=entry' }
)

export type MP_Entry = Static<typeof mp_entry>
