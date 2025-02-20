import { Static, Type } from '@sinclair/typebox'
import { p_altitude } from './p-altitude.js'
import { p_latitude } from './p-latitude.js'
import { p_longitude } from './p-longitude.js'

/**
 * microformats2 h-geo.
 *
 * All properties are optional.
 *
 * @see [h-geo - microformats.org](https://microformats.org/wiki/h-geo)
 * @see [h-geo - indieweb.org](https://indieweb.org/h-geo)
 */
export const h_geo = Type.Object(
  {
    altitude: Type.Optional(
      Type.Unsafe<Static<typeof p_altitude>>(Type.Ref(p_altitude.$id!))
    ),
    latitude: Type.Optional(
      Type.Unsafe<Static<typeof p_latitude>>(Type.Ref(p_latitude.$id!))
    ),
    longitude: Type.Optional(
      Type.Unsafe<Static<typeof p_longitude>>(Type.Ref(p_longitude.$id!))
    )
  },
  {
    $id: 'h-geo',
    title: 'microformats2 h-geo',
    description:
      'h-geo is a simple, open format for publishing WGS84 geographic coordinates.'
  }
)

/**
 * microformats2 h-geo.
 *
 * All properties are optional.
 *
 * @see [h-geo - microformats.org](https://microformats.org/wiki/h-geo)
 * @see [h-geo - indieweb.org](https://indieweb.org/h-geo)
 */
export type H_Geo = Static<typeof h_geo>
