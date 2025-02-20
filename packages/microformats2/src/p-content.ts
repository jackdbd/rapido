import { Static, Type } from '@sinclair/typebox'

export const p_content = Type.String({
  $id: 'p-content',
  title: 'Content',
  description: 'Some plain text content.',
  // p-content can be an empty string (e.g. in bookmarks, likes, reposts)
  minLength: 0
})

export type P_Content = Static<typeof p_content>
