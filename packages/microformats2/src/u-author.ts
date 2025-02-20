import { type Static, Type } from '@sinclair/typebox'

/**
 * Author of a post.
 *
 * @see [authorship - indieweb.org](https://indieweb.org/authorship)
 * @see [authorship-spec (authorship discovery algorithm) - indieweb.org](https://indieweb.org/authorship-spec)
 * @see [Authorship Rocks!](https://authorship.rocks/)
 */
export const u_author = Type.String({
  $id: 'u-author',
  title: 'Author',
  description: 'Author of a post (to use in h-entry, h-recipe).',
  format: 'uri'
})

export type U_Author = Static<typeof u_author>
