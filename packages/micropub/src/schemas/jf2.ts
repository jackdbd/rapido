import { Static, Type } from '@sinclair/typebox'
import { date, jf2_without_type } from '@jackdbd/microformats2'
import {
  access_token,
  action,
  h as post_type,
  mp_channel,
  mp_destination,
  mp_limit,
  mp_post_status,
  mp_slug,
  mp_syndicate_to,
  mp_visibility
} from './micropub-reserved-properties.js'

/**
 * @see [Simplified JSON - JF2 specification](https://jf2.spec.indieweb.org/#simplified-json)
 */
const shared = Type.Object({
  ...jf2_without_type.properties,

  access_token: Type.Optional(access_token),

  action: Type.Optional(action),

  'mp-channel': Type.Optional(mp_channel),

  'mp-destination': Type.Optional(mp_destination),

  'mp-limit': Type.Optional(mp_limit),

  /**
   * Command to instruct the Micropub server to set the alt text for a photo.
   *
   * I have seen it used in [this article](https://book.micro.blog/micropub/).
   *
   */
  'mp-photo-alt': Type.Optional(
    Type.Union([
      Type.String({ minLength: 1 }),
      Type.Array(Type.String({ minLength: 1 }))
    ])
  ),

  'mp-post-status': Type.Optional(mp_post_status),

  'mp-slug': Type.Optional(mp_slug),

  'mp-syndicate-to': Type.Optional(mp_syndicate_to),

  'post-status': Type.Optional(mp_post_status),

  published: Type.Optional(date),

  // 'read-of': Type.Optional(Type.Union([u_url, h_cite])),

  // 'read-status': Type.Optional(
  //   Type.Union([
  //     Type.Literal('to-read'),
  //     Type.Literal('reading'),
  //     Type.Literal('finished')
  //   ])
  // ),

  updated: Type.Optional(date),

  visibility: Type.Optional(mp_visibility)
})

/**
 * Micropub post from a request sent with `Content-Type: application/json`.
 *
 * The body parsed from a request sent with `Content-Type: application/json`
 * should have the property `type`, and not the property `h`.
 */
export const jf2_json = Type.Object(
  {
    ...shared.properties,
    type: Type.Optional(post_type)
  },
  {
    title: 'JF2 (json)',
    description:
      'Micropub post from requests sent with `Content-Type: application/json`.'
  }
)

export type JF2_JSON = Static<typeof jf2_json>

/**
 * Micropub post from a request sent with either one of these values for the
 * `Content-Type` request header:
 *
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * The object parsed from a request sent with either one these values of
 * `Content-Type` should have a property `h`, and not a property `type`.
 */
export const jf2_urlencoded_or_multipart = Type.Object(
  {
    ...shared.properties,
    h: Type.Optional(post_type)
  },
  {
    title: 'JF2 (x-www-form-urlencoded or multipart/form-data)',
    description:
      'Micropub post from requests sent with `Content-Type: application/x-www-form-urlencoded` or `Content-Type: multipart/form-data`.'
  }
)

/**
 * A Micropub post object created after parsing the body of a request sent with
 * when the `Content-Type: application/x-www-form-urlencoded` should have the
 * property `h`, and not the property `type`.
 */
export type JF2_Urlencoded_Or_Multipart = Static<
  typeof jf2_urlencoded_or_multipart
>

/**
 * Micropub post from requests sent with any one of these values of the
 * `Content-Type` request header:
 *
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 */
export const jf2 = Type.Union([jf2_json, jf2_urlencoded_or_multipart], {
  title: 'JF2',
  description:
    'Micropub post from requests sent with any one of these values of `Content-Type`: `application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`.'
})

/**
 * Micropub post from requests sent with any one of these values of the
 * `Content-Type` request header:
 *
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 */
export type JF2 = Static<typeof jf2>
