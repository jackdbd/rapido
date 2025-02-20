/**
 * Reserved properties for JF2.
 *
 * These properties are reserved and cannot be used as property names in vocabularies:
 * @see https://www.w3.org/TR/jf2/#reservedproperties
 */
import { Type, type Static } from '@sinclair/typebox'

export const children = Type.Any({
  title: 'Children',
  description: `Container for all unnamed sub-objects inside an entry.`
})

export const content_type = Type.String({
  title: 'Content-Type',
  description: `The MIME media type of the containing object's original source. Content-type MUST be a single string value only.`
})

export const html = Type.String({
  title: 'HTML',
  description:
    'The text/html version of the containing object. `html` MUST be a single string value only.'
})

// TODO: how can I enforce this string to be RFC5646 compliant? With an extra format for ajv?
export const lang = Type.String({
  title: 'Lang',
  description: `The localization language of the containing object and all sub-objects, unless overridden by another lang definition. Setting lang at a lower level overrides any lang value set at higher levels. This value MUST be a single string value and MUST be a [RFC5646] language tag.`
})

export const references = Type.Any({
  title: 'References',
  description: `An associative array, serialized as a JSON object, of all sub-objects inside an object which have "id" defined as an external URL.`
})

export const text = Type.String({
  title: 'Text',
  description:
    'The text/plain version of the containing object. `text` MUST be a single string value only.'
})

/**
 * Type of the JF2 object.
 *
 * The `type` property defines the object classification. In microformats, this is presumed to be an h-* class from the
 * microformats2 vocabulary. Type MUST be a single string value only.
 *
 * @see [Reserved Properties - JF2 Post Serialization Format](https://jf2.spec.indieweb.org/#reservedproperties)
 */
export const jf2_type = Type.String({
  title: 'type',
  description:
    'Defines the object classification. In microformats, this is presumed to be an h-* class from the microformats2 vocabulary. Type MUST be a single string value only.',
  minLength: 1,
  examples: ['card', 'cite', 'entry', 'event']
})

export type JF2Type = Static<typeof jf2_type>

/**
 * Context of the vocabulary as defined in JSON-LD.
 *
 * This attribute MAY be omitted and has an inferred value if not present. If it
 * is present it MUST be present at the top level entry only.
 *
 * @see [Reserved Properties - JF2 Post Serialization Format](https://jf2.spec.indieweb.org/#reservedproperties)
 * @see [JSON-LD Consideration - JF2 Post Serialization Format](https://jf2.spec.indieweb.org/#JSON-LD)
 */
export const at_context = Type.String({
  title: '@context',
  description: 'Context of the vocabulary as defined in JSON-LD.'
})
