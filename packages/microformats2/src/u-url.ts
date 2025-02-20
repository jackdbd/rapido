import { Static, Type } from '@sinclair/typebox'

export const u_url = Type.String({
  $id: 'u-url',
  title: 'URL',
  description: 'URL of the card, entry, event, etc.',
  format: 'uri'
})

export type U_URL = Static<typeof u_url>
