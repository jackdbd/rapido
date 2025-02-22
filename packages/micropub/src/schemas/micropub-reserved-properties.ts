/**
 * Properties beginning with `mp-` are reserved as a mechanism for Micropub
 * clients to give commands to Micropub servers.
 *
 * Clients and servers wishing to experiment with creating new `mp-` commands
 * are encouraged to brainstorm and document implementations at
 * indieweb.org/Micropub-extensions.
 *
 * @see https://indieweb.org/Micropub#Examples_of_Creating_Objects
 * @see https://micropub.spec.indieweb.org/#reserved-properties
 * @see https://www.w3.org/TR/micropub/#reserved-properties
 * @see https://www.w3.org/TR/micropub/#syndication-targets
 * @see https://www.w3.org/TR/micropub/#vocabulary-p-1
 * @see https://indieweb.org/Micropub-extensions
 * @see https://indieweb.org/mp-syndicate-to
 */
import { Static, Type } from '@sinclair/typebox'

/**
 * The OAuth Bearer token authenticating the request (the access token may be
 * sent in an HTTP Authorization header or this form parameter).
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const access_token = Type.String({
  $id: 'mp-access-token',
  title: 'Access Token',
  description:
    'The OAuth Bearer token authenticating the request (the access token may be sent in an HTTP Authorization header or this form parameter).'
})

/**
 * Action to perform on the object (updates are not supported in the
 * form-encoded syntax).
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const action = Type.Union(
  [
    Type.Literal('create'),
    Type.Literal('update'),
    Type.Literal('delete'),
    Type.Literal('undelete')
  ],
  {
    $id: 'mp-action',
    title: 'Action',
    description:
      'Action to perform on the object (updates are not supported in the form-encoded syntax).',
    default: 'create'
  }
)

export type Action = Static<typeof action>

export const jf2_type = Type.Union(
  [
    Type.Literal('card'),
    Type.Literal('cite'),
    Type.Literal('entry'),
    Type.Literal('event')
  ],
  {
    title: 'JF2 type',
    description: 'Type of the JF2 object.'
  }
)

/**
 * The type of a JF2 object used in the Micropub protocol.
 */
export type JF2_Type = Static<typeof jf2_type>

/**
 * Micropub post type.
 *
 * Use `h` for an `x-www-form-urlencoded` or `multipart/form-data` requests.
 * Use `type` for an `application/json` requests.
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [post - indieweb.org](https://indieweb.org/post)
 * @see [post type - indieweb.org](https://indieweb.org/Category:PostType)
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const entry_post_type = Type.Union(
  [
    Type.Literal('acquisition'),
    Type.Literal('article'),
    Type.Literal('audio'),
    Type.Literal('bookmark'),
    Type.Literal('bucketlist'),
    Type.Literal('checkin'),
    Type.Literal('chicken'),
    Type.Literal('collection'),
    Type.Literal('comics'),
    Type.Literal('donation'),
    Type.Literal('edit'),
    Type.Literal('event'),
    Type.Literal('exercise'),
    Type.Literal('food'),
    Type.Literal('issue'),
    Type.Literal('jam'),
    Type.Literal('like'),
    // Type.Literal('multi-photo'), // should this be its own type?
    Type.Literal('note'),
    Type.Literal('performance'),
    Type.Literal('photo'),
    Type.Literal('presentation'),
    Type.Literal('quotation'),
    Type.Literal('read'),
    Type.Literal('recipe'),
    Type.Literal('reply'),
    Type.Literal('repost'),
    Type.Literal('rsvp'),
    Type.Literal('scrobble'),
    Type.Literal('session'),
    Type.Literal('sleep'),
    Type.Literal('snark'),
    Type.Literal('study'),
    Type.Literal('task'),
    Type.Literal('venue'),
    Type.Literal('video'),
    Type.Literal('want'),
    Type.Literal('wish')
  ],
  {
    title: 'Post type',
    description: 'Type of the Micropub post.'
  }
)

/**
 * Micropub post type.
 *
 * Use `h` for an `x-www-form-urlencoded` or `multipart/form-data` requests.
 * Use `type` for an `application/json` requests.
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [post - indieweb.org](https://indieweb.org/post)
 * @see [post type - indieweb.org](https://indieweb.org/Category:PostType)
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export type EntryPostType = Static<typeof entry_post_type>

/**
 * JF2 object in the context of the Micropub protocol. If no type is specified,
 * the default type `entry` SHOULD be used.
 *
 * @see [Create - Micropub spec](https://micropub.spec.indieweb.org/#create)
 */
export const h = Type.Union([jf2_type, entry_post_type], {
  title: 'JF2 type',
  description:
    'Type of a JF2 object used in the context of the Micropub protocol.',
  default: 'entry'
})

export type H = Static<typeof h>

// aliases
export const post_type = h
export type PostType = H

export const mp_channel = Type.String()

export const mp_destination = Type.String({
  $id: 'mp-destination',
  title: 'Destination',
  description:
    'Specify a destination to create a new post on a web site other than the default.'
  // format: 'uri'
})

export const mp_limit = Type.Number({
  minimum: 0,
  $id: 'mp-limit',
  title: 'Limit',
  description:
    'Adds the parameter limit to any query to limit the number of returned results.'
})

export const mp_post_status = Type.String({
  $id: 'mp-post-status',
  title: 'Post status',
  description: 'Allows a Micropub client to set the status of a post.'
})

export const mp_slug = Type.String({
  $id: 'mp-slug',
  title: 'Slug',
  description:
    'Allows a Micropub client to suggest a slug to the Micropub endpoint.',
  minLength: 1
})

const mp_syndicate_to_item = Type.String({
  title: 'Syndication target',
  description: 'URL where the content will be syndicated to.',
  format: 'uri'
})

export const mp_syndicate_to = Type.Union(
  [mp_syndicate_to_item, Type.Array(mp_syndicate_to_item)],
  {
    $id: 'mp-syndicate-to',
    title: 'Syndicate to',
    description: 'Syndication target/s.'
  }
)

export type MP_Syndicate_To = Static<typeof mp_syndicate_to>

export const mp_visibility = Type.Union(
  [Type.Literal('public'), Type.Literal('private'), Type.Literal('unlisted')],
  {
    $id: 'mp-visibility',
    title: 'Visibility',
    description:
      'Adds a property for use in Micropub requests called visibility that informs a server whether a post should be public, private or unlisted.',
    default: 'public'
  }
)

export type MP_Visibility = Static<typeof mp_visibility>

/**
 * The URL of the object being acted of.
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const url = Type.String({
  title: 'URL',
  description: 'Indicates the URL of the object being acted of.',
  format: 'uri'
})
