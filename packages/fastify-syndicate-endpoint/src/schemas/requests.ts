import { Static, Type } from '@sinclair/typebox'

export const syndicate_request_body = Type.Object({
  feed: Type.Optional(Type.String({ format: 'uri' }))
  //   feed: Type.String({ format: 'uri' })
})

export type SyndicateRequestBody = Static<typeof syndicate_request_body>
