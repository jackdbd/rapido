import { jf2ToContent, syndicate } from '@jackdbd/micropub/schemas'
import type { JF2ToContent, Syndicate } from '@jackdbd/micropub/schemas'
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

export const syndicator = Type.Object({ name, jf2ToContent, syndicate, uid })

export interface Syndicator extends Static<typeof syndicator> {
  jf2ToContent: JF2ToContent
  syndicate: Syndicate
}
