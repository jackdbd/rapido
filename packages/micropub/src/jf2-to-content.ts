import sanitizeHtml from 'sanitize-html'
import yaml from 'yaml'
import type { JF2 } from './schemas/jf2.js'
import {
  jf2WithNoSensitiveProps,
  jf2WithNoUselessProps
} from './sanitize-jf2.js'

export const jf2ToContentWithFrontmatter = (input: JF2) => {
  const jf2 = jf2WithNoSensitiveProps(input)

  const { content, ...frontmatter } = jf2WithNoUselessProps(jf2)

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
