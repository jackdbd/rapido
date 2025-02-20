import { Static, Type } from '@sinclair/typebox'

export const p_publication = Type.String({
  $id: 'p-publication',
  title: 'Publication',
  description: 'Used for citing articles, books, etc (used in h-cite).',
  minLength: 1
})

export type P_Publication = Static<typeof p_publication>
