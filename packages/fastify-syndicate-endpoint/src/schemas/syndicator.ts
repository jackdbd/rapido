import {
  createContentToSyndicate,
  jf2ToContent,
  retrieveContentsToSyndicate,
  syndicate
} from '@jackdbd/micropub/schemas'
import type {
  CreateContentToSyndicate,
  JF2ToContent,
  RetrieveContentsToSyndicate,
  Syndicate
} from '@jackdbd/micropub/schemas'
import { Type, type Static } from '@sinclair/typebox'

export const name = Type.String({
  title: 'Name',
  description: 'The human readable name of the syndicator.',
  minLength: 1
})

export const uid = Type.String({
  title: 'UID',
  description: 'Unique identifier for the syndicator',
  minLength: 1
})

export const syndicator = Type.Object({
  createContentToSyndicate,
  name,
  jf2ToContent,
  retrieveContentsToSyndicate,
  syndicate,
  uid
})

export interface Syndicator extends Static<typeof syndicator> {
  createContentToSyndicate: CreateContentToSyndicate
  jf2ToContent: JF2ToContent
  retrieveContentsToSyndicate: RetrieveContentsToSyndicate
  syndicate: Syndicate
}
