import type { JF2 } from './schemas/jf2.js'
import slugifyFn from 'slugify'

const replacement_character = '-'

const slugify_options = {
  lower: true,
  replacement: replacement_character, // replace spaces with replacement character
  remove: /[*+~.·,()'"`´%!?¿:@\/]/g
}

export const sanitize = (str: string) => {
  return str
    .replace(/^https?:\/\//, '')
    .replaceAll(/\//g, replacement_character)
    .replaceAll(/\./g, replacement_character)
}

/**
 * Creates a slug from a JF2 object.
 *
 * The Micropub server MAY or MAY NOT decide to respect the requested slug,
 * based on whether it would cause conflicts with other URLs on the site.
 *
 * Does this imply that this function should check the website, and so be async?
 * Could the caller fetch the website and see if an URL with the same slug
 * already exists?
 *
 * @see https://indieweb.org/Micropub-extensions#Slug
 */
export const jf2ToSlug = (jf2: JF2) => {
  if (!jf2) {
    throw new Error(`cannot generate slug of ${jf2}`)
  }

  let str = jf2['mp-slug']
  if (str) {
    return str.toLowerCase()
  }

  if (jf2.name) {
    str = jf2.name
  } else if (jf2.summary) {
    str = jf2.summary
  } else if (jf2['bookmark-of']) {
    str = sanitize(jf2['bookmark-of'])
  } else if (jf2['in-reply-to']) {
    str = sanitize(jf2['in-reply-to'])
  } else if (jf2['like-of']) {
    str = sanitize(jf2['like-of'])
  } else if (jf2['repost-of']) {
    str = sanitize(jf2['repost-of'])
  } else if (jf2.content) {
    if (typeof jf2.content === 'string') {
      // If the source of the post was written as string, we treat it as plain text.
      str = jf2.content
    } else {
      str = jf2.content.text || jf2.content.html
    }
  } else {
    const props = [
      'mp-slug',
      'name',
      'summary',
      'bookmark-of',
      'in-reply-to',
      'like-of',
      'repost-of',
      'content',
      'content.html',
      'content.text'
    ]
    throw new Error(
      `object has none of these properties that could be used to generate a slug: ${props.join(', ')}`
    )
  }

  if (!str) {
    throw new Error(`cannot generate empty slug`)
  }

  // I have no idea why tsc tells me "This expression is not callable."
  // return slugifyFn(str, slugify_options);
  return (slugifyFn as any)(str.replace(/^www-/, ''), slugify_options)
}
