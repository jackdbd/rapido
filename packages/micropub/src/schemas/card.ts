import { type Static, Type } from '@sinclair/typebox'
import { h_card } from '@jackdbd/microformats2'
import { mp_slug, mp_syndicate_to } from './micropub-reserved-properties.js'

export const mp_card = Type.Object(
  {
    ...h_card.properties,

    h: Type.Literal('card'),

    'mp-slug': Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),
    'mp-syndicate-to': Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    ),

    // Since in Micropub we use `h` to indicate the type of the object, we don't
    // need `type` to be present. But if it is, it must be 'card'.
    type: Type.Optional(Type.Literal('card'))
  },
  { $id: 'micropub-card', title: 'Micropub h=card' }
)

export type MP_Card = Static<typeof mp_card>
