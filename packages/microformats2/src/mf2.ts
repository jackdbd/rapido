import { Static, Type } from '@sinclair/typebox'

export const mf2_item_type = Type.Union(
  [
    Type.Literal('h-card'),
    Type.Literal('h-cite'),
    Type.Literal('h-entry'),
    Type.Literal('h-event')
  ],
  { default: 'h-entry', title: 'Microformats item type' }
)

export type MF2ItemType = Static<typeof mf2_item_type>

/**
 * @see [Parsed Microformats JSON - JF2 specification](https://jf2.spec.indieweb.org/#parsed-microformats-json)
 */
export const parsed_mf2_json = Type.Object(
  {
    type: Type.Array(mf2_item_type, { readOnly: true }),
    properties: Type.Record(
      Type.String({ description: 'Name of the property' }),
      Type.Any({ description: 'Value of the property' }),
      { readOnly: true }
    )
  },
  { readOnly: true, title: 'Parsed Microformats JSON' }
)

export type ParsedMF2 = Readonly<Static<typeof parsed_mf2_json>>

export const mf2 = Type.Object(
  { items: Type.Array(parsed_mf2_json, { readOnly: true }) },
  { readOnly: true }
)

export type MF2 = Readonly<Static<typeof mf2>>
