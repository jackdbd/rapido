import { type Static, Type } from '@sinclair/typebox'
import { h_event } from '@jackdbd/microformats2'
import { mp_slug, mp_syndicate_to } from './micropub-reserved-properties.js'

export const event = Type.Object(
  {
    ...h_event.properties,

    'mp-slug': Type.Optional(
      Type.Unsafe<Static<typeof mp_slug>>(Type.Ref(mp_slug.$id!))
    ),
    'mp-syndicate-to': Type.Optional(
      Type.Unsafe<Static<typeof mp_syndicate_to>>(
        Type.Ref(mp_syndicate_to.$id!)
      )
    )
  },
  {
    $id: 'micropub-event',
    title: 'Micropub h=event',
    examples: [
      {
        type: 'event',
        location: 'Some bar in SF',
        name: 'Microformats Meetup',
        start: '2013-06-30 12:00:00-07:00',
        end: '2013-06-30 18:00:00-07:00',
        summary: 'Get together and discuss all things microformats-related.',
        'mp-slug': 'microformats-meetup-in-sf',
        'mp-syndicate-to': [
          'https://fosstodon.org/@jackdbd',
          'https://news.indieweb.org/en'
        ]
      }
    ]
  }
)

export type MP_Event = Static<typeof event>
