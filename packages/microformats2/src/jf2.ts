import { Static, Type } from '@sinclair/typebox'
import { date } from './date.js'
import { dt_start } from './dt-start.js'
import { dt_end } from './dt-end.js'
import { e_content } from './e-content.js'
import { h_adr } from './h-adr.js'
import { h_card } from './h-card.js'
import { h_cite } from './h-cite.js'
import { p_author } from './p-author.js'
import { p_category } from './p-category.js'
import { p_content } from './p-content.js'
import { p_geo } from './p-geo.js'
import { p_location } from './p-location.js'
import { p_name } from './p-name.js'
import { p_publication } from './p-publication.js'
import { p_rsvp } from './p-rsvp.js'
import { p_summary } from './p-summary.js'
import { u_audio } from './u-audio.js'
import { u_syndication } from './u-syndication.js'
import { u_url } from './u-url.js'
import { u_video } from './u-video.js'
import { jf2_type } from './jf2-reserved-properties.js'

/**
 * @see [Simplified JSON - JF2 specification](https://jf2.spec.indieweb.org/#simplified-json)
 */
export const jf2_without_type = Type.Object(
  {
    audio: Type.Optional(Type.Union([u_audio, Type.Array(u_audio)])),

    author: Type.Optional(Type.Union([p_author, h_card])),

    'bookmark-of': Type.Optional(u_url),

    category: Type.Optional(Type.Union([p_category, Type.Array(p_category)])),

    checkin: Type.Optional(Type.String({ minLength: 1 })),

    content: Type.Optional(Type.Union([p_content, e_content])),

    date: Type.Optional(date),

    end: Type.Optional(dt_end),

    'in-reply-to': Type.Optional(u_url),

    'like-of': Type.Optional(u_url),

    location: Type.Optional(Type.Union([p_location, p_geo, h_adr])),

    name: Type.Optional(p_name),

    photo: Type.Optional(Type.Any()),

    'read-of': Type.Optional(Type.Union([p_publication, u_url, h_cite])),

    'read-status': Type.Optional(
      Type.Union([
        Type.Literal('to-read'),
        Type.Literal('reading'),
        Type.Literal('finished')
      ])
    ),

    'repost-of': Type.Optional(u_url),

    rsvp: Type.Optional(p_rsvp),

    start: Type.Optional(dt_start),

    summary: Type.Optional(p_summary),

    syndication: Type.Optional(u_syndication),

    url: Type.Optional(Type.Union([u_url, Type.Array(u_url)])),

    video: Type.Optional(Type.Union([u_video, Type.Array(u_video)]))
  },
  {
    additionalProperties: true,
    title: 'JF2 (Simplified Microformats JSON)'
  }
)

export type JF2WithoutType = Static<typeof jf2_without_type>

/**
 * A JF2 object created after parsing the body of a request sent with when the
 * `Content-Type: application/json` should have the property `type`, and not the
 * property `h`.
 */
export const jf2 = Type.Object({
  ...jf2_without_type.properties,
  type: Type.Optional(jf2_type)
})

export type JF2 = Static<typeof jf2>
