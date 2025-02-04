import { Static, Type } from '@sinclair/typebox'

export const u_url = Type.String({
  $id: 'u-url',
  title: 'URL of the card, entry, event, etc.',
  description: 'URL to use in h-card, h-entry, h-event, etc.',
  format: 'uri'
})

export type U_URL = Static<typeof u_url>
