import { type Static, Type } from '@sinclair/typebox'
import { h_card } from '@jackdbd/microformats2'
import { mp_slug, mp_syndicate_to } from './micropub-reserved-properties.js'

export const mp_card = Type.Object(
  {
    ...h_card.properties,

    'mp-slug': Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),
    'mp-syndicate-to': Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    )
  },
  { $id: 'micropub-card', title: 'Micropub h=card' }
)

export type MP_Card = Static<typeof mp_card>
