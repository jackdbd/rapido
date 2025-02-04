import { Static, Type } from '@sinclair/typebox'
import { dt_accessed } from './dt-accessed.js'
import { dt_published } from './dt-published.js'
import { p_author } from './p-author.js'
import { p_content } from './p-content.js'
import { p_name } from './p-name.js'
import { p_publication } from './p-publication.js'
import { u_uid } from './u-uid.js'
import { u_url } from './u-url.js'

/**
 * microformats2 h-cite.
 *
 * @see https://microformats.org/wiki/h-cite
 * @see https://indieweb.org/h-cite
 */
export const h_cite = Type.Object(
  {
    /**
     * date the cited work was accessed for whatever reason it is being cited.
     * Useful in case online work changes and it's possible to access the
     * dt-accessed datetimestamped version in particular, e.g. via the Internet
     * Archive.
     */
    accessed: Type.Optional(
      Type.Unsafe<Static<typeof dt_accessed>>(Type.Ref(dt_accessed.$id!))
    ),

    /**
     * author of publication, with optional nested h-card
     *
     * TODO: author could be either a string or a h-cite itself.
     * See here:
     * - https://github.com/sinclairzx81/typebox#types-recursive
     * - https://github.com/grantcodes/postr/blob/master/schema/hCite.js
     */
    author: Type.Optional(
      Type.Unsafe<Static<typeof p_author>>(Type.Ref(p_author.$id!))
    ),

    /**
     * for when the citation includes the content itself, like when citing short
     * text notes (e.g. tweets).
     */
    content: Type.Optional(
      Type.Unsafe<Static<typeof p_content>>(Type.Ref(p_content.$id!))
    ),

    /**
     * name of the work
     */
    name: Type.Optional(
      Type.Unsafe<Static<typeof p_name>>(Type.Ref(p_name.$id!))
    ),

    /**
     * for citing articles in publications with more than one author, or perhaps
     * when the author has a specific publication vehicle for the cited work.
     * Also works when the publication is known, but the authorship information is
     * either unknown, ambiguous, unclear, or collaboratively complex enough to be
     * unable to list explicit author(s), e.g. like with many wiki pages.
     */
    publication: Type.Optional(
      Type.Unsafe<Static<typeof p_publication>>(Type.Ref(p_publication.$id!))
    ),

    /**
     * date (and optionally time) of publication
     */
    published: Type.Optional(
      Type.Unsafe<Static<typeof dt_published>>(Type.Ref(dt_published.$id!))
    ),

    type: Type.Literal('cite'),

    /**
     * a URL/URI that uniquely/canonically identifies the cited work, canonical
     * permalink.
     */
    uid: Type.Optional(Type.Unsafe<Static<typeof u_uid>>(Type.Ref(u_uid.$id!))),

    /**
     * a URL to access the cited work
     */
    url: Type.Optional(Type.Unsafe<Static<typeof u_url>>(Type.Ref(u_url.$id!)))
  },
  {
    $id: 'h-cite',
    title: 'microformats2 h-cite',
    description:
      'h-cite is a simple, open format for publishing citations and references to online and other publications.',
    examples: [
      {
        author: 'Isaac Newton',
        name: 'The Correspondence of Isaac Newton: Volume 5',
        content:
          'If I have seen further it is by standing on the shoulders of Giants.'
      }
    ]
  }
)

export type H_Cite = Static<typeof h_cite>
