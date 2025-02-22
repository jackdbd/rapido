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
 * Properties shared between a request body sent to the micropub endpoint using
 * any one of these values for the `Content-Type` request header:
 *
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * These properties are all the properties defined in the basic JF2 vocabulary,
 * plus all the properties defined in the Micropub JF2 vocabulary, minus the
 * `type` property (which is defined only in request bodies sent with
 * `application/json`).
 *
 * @see [Simplified JSON - JF2 specification](https://jf2.spec.indieweb.org/#simplified-json)
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
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
 * Micropub JF2 object resulting from parsing the request body of a request sent
 * with a `Content-Type: application/json` request header.
 *
 * The JF2 object:
 *
 * - SHOULD have a property `type` (if not present, the Micropub server MUST set
 *   it to `entry`).
 * - SHOULD NOT have a property `h` (if present, I **think** the Micropub server
 *   SHOULD ignore it).
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const jf2_application_json = Type.Object(
  {
    ...shared.properties,
    type: Type.Optional(post_type)
  },
  {
    additionalProperties: true,
    title: 'JF2 (application/json)',
    description:
      'Micropub post from requests sent with `Content-Type: application/json`.'
  }
)

/**
 * Micropub JF2 object resulting from parsing the request body of a request sent
 * with a `Content-Type: application/json` request header.
 *
 * The JF2 object:
 *
 * - SHOULD have a property `type` (if not present, the Micropub server MUST set
 *   it to `entry`).
 * - SHOULD NOT have a property `h` (if present, I **think** the Micropub server
 *   SHOULD ignore it).
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export type JF2_Application_JSON = Static<typeof jf2_application_json>

/**
 * Micropub JF2 object resulting from parsing the request body of a request sent
 * with either one of these values for the `Content-Type` request header:
 *
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * The JF2 object:
 *
 * - SHOULD have a property `h` (if not present, the Micropub server MUST set it
 *   to `entry`).
 * - SHOULD NOT have a property `type` (if present, I **think** the Micropub
 *   server SHOULD ignore it).
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const jf2_urlencoded_or_multipart = Type.Object(
  {
    ...shared.properties,
    h: Type.Optional(post_type)
  },
  {
    // This is the default in TypeBox, but I prefer to be explicit.
    // Micropub servers should follow the Postel's law and be liberal in their
    // receiving behavior.
    // https://indieweb.org/Postel's_law
    additionalProperties: true,
    title: 'JF2 (application/x-www-form-urlencoded or multipart/form-data)',
    description:
      'Micropub post from requests sent with `Content-Type: application/x-www-form-urlencoded` or `Content-Type: multipart/form-data`.'
  }
)

/**
 * Micropub JF2 object resulting from parsing the request body of a request sent
 * with either one of these values for the `Content-Type` request header:
 *
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * The JF2 object:
 *
 * - SHOULD have a property `h` (if not present, the Micropub server MUST set it
 *   to `entry`).
 * - SHOULD NOT have a property `type` (if present, I **think** the Micropub
 *   server SHOULD ignore it).
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export type JF2_Urlencoded_Or_Multipart = Static<
  typeof jf2_urlencoded_or_multipart
>

/**
 * JF2 object resulting from parsing the body of a request sent to the Micropub
 * endpoint using any one of these values for the `Content-Type` request header:
 *
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * The properties of this object are all the properties defined in the basic
 * [JF2 vocabulary](https://jf2.spec.indieweb.org/#reservedproperties), plus all
 * the properties defined in the [Micropub vocabulary](https://micropub.spec.indieweb.org/#reserved-properties).
 *
 *
 * Micropub servers should follow the [Postel's law](https://indieweb.org/Postel's_law)
 * (i.e. be liberal in their receiving behavior).
 */
export const jf2 = Type.Union(
  [jf2_application_json, jf2_urlencoded_or_multipart],
  {
    additionalProperties: true,
    title: 'JF2',
    description:
      'Micropub post from requests sent with any one of these values of `Content-Type`: `application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`.'
  }
)

/**
 * JF2 object resulting from parsing the body of a request sent to the Micropub
 * endpoint using any one of these values for the `Content-Type` request header:
 *
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `multipart/form-data`
 *
 * The properties of this object are all the properties defined in the basic
 * [JF2 vocabulary](https://jf2.spec.indieweb.org/#reservedproperties), plus all
 * the properties defined in the [Micropub vocabulary](https://micropub.spec.indieweb.org/#reserved-properties).
 *
 *
 * Micropub servers should follow the [Postel's law](https://indieweb.org/Postel's_law)
 * (i.e. be liberal in their receiving behavior).
 */
export type JF2 = Static<typeof jf2>
