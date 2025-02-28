import { Static, Type } from '@sinclair/typebox'
import { jf2_application_json } from '@jackdbd/micropub'

export const syndication_target_name = Type.String({ minLength: 1 })

export const canonical_url = Type.String({ format: 'uri' })

export const syndication_target_uid = Type.String({ minLength: 1 })

export const content_to_syndicate = Type.String({ minLength: 1 })

export const jf2ToContents_config = Type.Object({
  canonicalUrl: canonical_url,
  jf2: jf2_application_json
})

export const jf2ToContents = Type.Function(
  [jf2ToContents_config],
  Type.Array(content_to_syndicate),
  {
    title: 'jf2ToContents',
    description:
      'Takes a JF2 and generates all contents to syndicate to the syndication target.'
  }
)

/**
 * Maps a single JF2 object into N pieces of content that are suited to be
 * published to the syndication target.
 *
 * For example we might want to repurpose a single JF2 object representing a
 * long Micropub article into 10 small posts to be published to Mastodon.
 */
export type JF2ToContents = Static<typeof jf2ToContents>

export const syndicateContent_options = Type.Any()

const idempotencyKey = Type.String({ minLength: 1 })

const syndicate_response = Type.Object(
  { idempotencyKey },
  { additionalProperties: true }
)

export const syndicateContent = Type.Function(
  [content_to_syndicate, Type.Optional(syndicateContent_options)],
  Type.Promise(syndicate_response),
  {
    title: 'syndicateContent',
    description: 'Publish a piece of content to the syndication target.'
  }
)

/**
 * Publishes one piece of content to a syndication target.
 */
export type SyndicateContent = Static<typeof syndicateContent>

export const retrieveSyndicateResponse = Type.Function(
  [idempotencyKey],
  Type.Promise(syndicate_response)
)

/**
 * Retrieves a syndication response about a piece of content using an
 * idempotency key. If there is a response, the piece of content should not be
 * re-published, i.e. the syndication target acts as an [idempotent consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html).
 */
export type RetrieveSyndicateResponse = Static<typeof retrieveSyndicateResponse>

export const storeSyndicateResponse = Type.Function(
  [syndicate_response],
  Type.Promise(Type.Void())
)

/**
 * Stores the response received from the syndication target, together with an
 * idempotency key.
 */
export type StoreSyndicateResponse = Static<typeof storeSyndicateResponse>

export const syndication_target = Type.Object({
  jf2ToContents,
  name: syndication_target_name,
  retrieveSyndicateResponse: Type.Optional(retrieveSyndicateResponse),
  storeSyndicateResponse: Type.Optional(storeSyndicateResponse),
  syndicateContent,
  uid: syndication_target_uid
})

export interface SyndicationTarget extends Static<typeof syndication_target> {
  jf2ToContents: JF2ToContents
  retrieveSyndicateResponse?: RetrieveSyndicateResponse
  storeSyndicateResponse?: StoreSyndicateResponse
  syndicateContent: SyndicateContent
}
