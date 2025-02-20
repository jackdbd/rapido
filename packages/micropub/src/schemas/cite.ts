import { type Static, Type } from '@sinclair/typebox'
import { h_cite } from '@jackdbd/microformats2'
import { mp_slug, mp_syndicate_to } from './micropub-reserved-properties.js'

export const cite = Type.Object(
  {
    ...h_cite.properties,

    'mp-slug': Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),
    'mp-syndicate-to': Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    )
  },
  { $id: 'micropub-cite', title: 'Micropub h=cite' }
)

export type MP_Cite = Static<typeof cite>
