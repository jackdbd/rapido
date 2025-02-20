import { Type, type Static } from '@sinclair/typebox'
import { date } from './date.js'
import { e_content } from './e-content.js'
import { p_author } from './p-author.js'
import { p_category } from './p-category.js'
import { p_name } from './p-name.js'
import { p_summary } from './p-summary.js'
import { u_audio } from './u-audio.js'
import { u_photo } from './u-photo.js'
import { u_uid } from './u-uid.js'
import { u_url } from './u-url.js'
import { u_video } from './u-video.js'
import { jf2_feed_type } from './jf2-feed-reserved-properties.js'

/**
 * JF2 Feed.
 *
 * @see [Required Fields and Required Formats - JF2 Post Serialization Format](https://jf2.spec.indieweb.org/#jf2feed_required_fields)
 */
export const jf2_feed = Type.Object({
  /**
   * MAY be present on any second level entry object. If present, it MUST be an
   * object as described in the multiple URLs section with at least a 'url'
   * property which MUST be a single string and a valid [URL].
   */
  audio: Type.Optional(u_audio),

  /**
   * MAY be present on the top level feed or second level entry objects. If
   * present, it MUST be an object and it MUST contain at least a name, url, or
   * photo property.
   */
  author: Type.Optional(
    Type.Object({
      name: p_author,
      photo: Type.Optional(u_photo),
      url: Type.Optional(u_url)
    })
  ),

  category: Type.Optional(p_category),

  /**
   * MAY be present on any entry object which is a direct child of the top level
   * feed object. If present, this property MUST be an object as described in
   * the HTML content regardless if only a text/plain version is available.
   *
   * @see [HTML Content - JF2 Post Serialization Format](https://www.w3.org/TR/jf2/#html-content)
   */
  content: Type.Optional(e_content),

  /**
   * MUST be defined on the top level "feed" object. This value MUST be a single
   * string value. Any direct children of the top level item SHOULD have this
   * property and if present MUST be a single string value.
   */
  name: p_name,

  photo: Type.Optional(u_photo),

  /**
   * SHOULD be present on any entry object which is a direct child of the top
   * level feed object. If present, this property MUST be a single string value
   * and MUST be formatted as specified by [ISO8601].
   */
  published: Type.Optional(date),

  /**
   * MAY be present on any second level entry object. If present, it MUST be a
   * single string.
   */
  summary: Type.Optional(p_summary),

  /**
   * MUST be present on any entry object which is a direct child of the top
   * level feed object. This property MUST be a single string value and MUST
   * uniquely identify this entry object. This MAY be a duplicate of the entry's
   * url property.
   */
  uid: Type.Optional(u_uid),

  /**
   * MAY be present on any entry object which is a direct child of the top level
   * feed object. If present, this property MUST be a single string value and
   * MUST be formatted as specified by [ISO8601].
   */
  updated: Type.Optional(date),

  url: Type.Optional(u_url),

  /**
   * MUST be defined with a value of "feed" on the top level entry.
   * All other sub-object items MUST NOT have a type value of "feed".
   * All direct children of the top level feed object MUST have a value of "entry".
   */
  type: jf2_feed_type,

  /**
   * MAY be present on any second level entry object. If present, it MUST be an
   * object as described in the multiple URLs section with at least a 'url'
   * property which MUST be a single string and a valid [URL].
   */
  video: Type.Optional(u_video)
})

export type JF2Feed = Static<typeof jf2_feed>
