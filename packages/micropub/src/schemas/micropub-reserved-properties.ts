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

/**
 * Micropub post type.
 *
 * Use `h` for an `x-www-form-urlencoded` or `multipart/form-data` requests.
 * Use `type` for an `application/json` requests.
 *
 * A few POST body property names are reserved when requests are sent as
 * `x-www-form-urlencoded` or `multipart/form-data`.
 *
 * @see [Reserved Properties - Micropub spec](https://micropub.spec.indieweb.org/#reserved-properties)
 */
export const h = Type.Union(
  [
    Type.Literal('card'),
    Type.Literal('cite'),
    Type.Literal('entry'),
    Type.Literal('event')
  ],
  {
    title: 'Post type',
    description: 'Micropub post type.',
    default: 'entry'
  }
)

export type H = Static<typeof h>

// alias
export type MP_Post_Type = Static<typeof h>

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
