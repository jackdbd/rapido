import sanitizeHtml from 'sanitize-html'
import yaml from 'yaml'
import type { JF2 } from './schemas/jf2.js'

/**
 * Properties that should be discarded from a JF2 object before persisting to
 * storage the information the JF2 object contains.
 * - `access_token`: the information contained in the JF2 object could be
 *   publicly available (e.g. users might use a public GitHub repository as
 *   their content store), so we make sure we don't store any access token.
 * - `action`: no point in storing it in a content store.
 * - `h`: no point in storing it in a content store.
 * - `type`: no point in storing it in a content store.
 * - `mp-slug`: it's a Micropub server command, so we don't need to store it in
 * a content store.
 */
const DROP_PROPS = new Set(['access_token', 'action', 'h', 'mp-slug', 'type'])

export const jf2SafeToStore = (input: JF2) => {
  const output: JF2 = Object.entries(input).reduce((acc, [key, value]) => {
    if (DROP_PROPS.has(key)) {
      return acc
    } else {
      return { ...acc, [key]: value }
    }
  }, {})

  return output
}

export const jf2ToContentWithFrontmatter = (jf2: JF2) => {
  const { content, ...frontmatter } = jf2SafeToStore(jf2)

  let fm: string | undefined
  if (Object.keys(frontmatter).length !== 0) {
    fm = `---\n${yaml.stringify(frontmatter)}---\n`
  }

  // Consider using this library for the frontmatter:
  // https://github.com/importantimport/fff

  if (content) {
    if (typeof content === 'string') {
      // If the source of the post was written as string, the Micropub endpoint
      // MUST return a string value for the content property, and the Micropub
      // client will treat the value as plain text.
      return fm ? `${fm}\n${content}` : content
    } else {
      // If the source of the post was written as HTML content, the Micropub
      // endpoint MUST return the content property as an object containing an
      // html property.
      const html = sanitizeHtml(content.html)
      return fm ? `${fm}\n${html}` : html
    }
  } else {
    // Bookmarks, likes, reposts often have no text content. For them, we only
    // include the frontmatter.
    return fm ? fm : ''
  }
}
