import { type Static, Type } from '@sinclair/typebox'

const u_syndication_item = Type.String({
  title: 'Syndication target',
  description: 'URL where the content was syndicated to.',
  format: 'uri'
})

export const u_syndication = Type.Union(
  [u_syndication_item, Type.Array(u_syndication_item)],
  {
    $id: 'u-syndication',
    title: 'Syndication',
    description:
      'URL(s) of syndicated copies of this post. The property equivalent of rel-syndication.'
  }
)

export type U_Syndication = Static<typeof u_syndication>
