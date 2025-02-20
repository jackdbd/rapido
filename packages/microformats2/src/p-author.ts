import { Static, Type } from '@sinclair/typebox'

/**
 * Author of a post.
 *
 * @see [authorship - indieweb.org](https://indieweb.org/authorship)
 * @see [authorship-spec (authorship discovery algorithm) - indieweb.org](https://indieweb.org/authorship-spec)
 * @see [Authorship Rocks!](https://authorship.rocks/)
 */
export const p_author = Type.String({
  $id: 'p-author',
  title: 'Author',
  description: 'Author of a post (to use in h-entry, h-recipe).',
  minLength: 1
})

export type P_Author = Static<typeof p_author>
