/**
 * Reserved properties for JF2 Feed.
 *
 * @see [Required Fields and Required Formats - JF2 Post Serialization Format](https://www.w3.org/TR/jf2/#jf2feed_required_fields)
 */
import { Type, type Static } from '@sinclair/typebox'

// TODO: finish implementing this.

/**
 * JF2 Feed type.
 *
 * MUST be defined with a value of "feed" on the top level entry.
 * All other sub-object items MUST NOT have a type value of "feed".
 * All direct children of the top level feed object MUST have a value of "entry".
 */
/**
 * @see [Required Fields and Required Formats - JF2 Post Serialization Format](https://jf2.spec.indieweb.org/#jf2feed_required_fields)
 */
export const jf2_feed_type = Type.Literal('feed')

export type JF2FeedType = Static<typeof jf2_feed_type>
