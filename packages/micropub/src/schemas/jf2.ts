import { Static, Type } from '@sinclair/typebox'
import {
  p_content,
  e_content,
  p_summary,
  u_syndication,
  u_url
} from '@jackdbd/microformats2'

const jf2_item_type = Type.Union(
  [
    Type.Literal('card'),
    Type.Literal('cite'),
    Type.Literal('entry'),
    Type.Literal('event')
  ],
  { default: 'entry', title: 'JF2 item type' }
)

export type Jf2ItemType = Static<typeof jf2_item_type>

const string_or_strings = Type.Union([
  Type.String({ minLength: 1 }),
  Type.Array(Type.String({ minLength: 1 }))
])

// const url_or_urls = Type.Union([
//   Type.String({ format: 'uri' }),
//   Type.Array(Type.String({ format: 'uri' }))
// ])

const url_or_urls = Type.Union([u_url, Type.Array(u_url)])

const updated = Type.String({ minLength: 1 })

/**
 * @see [Simplified JSON - JF2 specification](https://jf2.spec.indieweb.org/#simplified-json)
 */
const shared = Type.Object(
  {
    action: Type.Optional(Type.String()),
    audio: Type.Optional(url_or_urls),
    author: Type.Optional(Type.Any()),
    'bookmark-of': Type.Optional(Type.String({ format: 'uri' })),
    category: Type.Optional(string_or_strings),
    checkin: Type.Optional(Type.String({ minLength: 1 })),
    content: Type.Optional(Type.Union([p_content, e_content])),
    date: Type.Optional(Type.String({ minLength: 1 })),
    'in-reply-to': Type.Optional(Type.String({ format: 'uri' })),
    'like-of': Type.Optional(Type.String({ format: 'uri' })),
    'mp-channel': Type.Optional(Type.String({ minLength: 1 })),
    'mp-destination': Type.Optional(Type.String({ minLength: 1 })),
    'mp-limit': Type.Optional(Type.String({ minLength: 1 })),
    'mp-photo-alt': Type.Optional(string_or_strings),
    'mp-slug': Type.Optional(Type.String({ minLength: 1 })),
    'mp-syndicate-to': Type.Optional(string_or_strings),
    name: Type.Optional(Type.String({ minLength: 1 })),
    photo: Type.Optional(Type.Any()),
    'post-status': Type.Optional(Type.String({ minLength: 1 })),
    published: Type.Optional(Type.String({ minLength: 1 })),
    'read-of': Type.Optional(Type.String({ format: 'uri' })),
    'read-status': Type.Optional(
      Type.Union([
        Type.Literal('to-read'),
        Type.Literal('reading'),
        Type.Literal('finished')
      ])
    ),
    'repost-of': Type.Optional(Type.String({ format: 'uri' })),
    rsvp: Type.Optional(
      Type.Union([
        Type.Literal('yes'),
        Type.Literal('no'),
        Type.Literal('maybe'),
        Type.Literal('interested')
      ])
    ),
    summary: Type.Optional(p_summary),
    syndication: Type.Optional(u_syndication),
    updated: Type.Optional(updated),
    url: Type.Optional(u_url),
    video: Type.Optional(url_or_urls),
    visibility: Type.Optional(Type.String({ minLength: 1 }))
  },
  {
    additionalProperties: true,
    title: 'JF2 (Simplified Microformats JSON)'
  }
)

export const jf2 = Type.Object({
  ...shared.properties,
  type: Type.Optional(jf2_item_type)
})

export type JF2 = Static<typeof jf2>

/**
 * Micropub request body (parsed) when the `Content-Type` is
 * `application/x-www-form-urlencoded`.
 */
export const mp_urlencoded_request_body = Type.Object(
  {
    ...shared.properties,
    h: Type.Optional(jf2_item_type)
  },
  { additionalProperties: true }
)

/**
 * Micropub request body (parsed) when the `Content-Type` is
 * `application/x-www-form-urlencoded`.
 */
export type MP_UrlencodedRequestBody = Static<typeof mp_urlencoded_request_body>
