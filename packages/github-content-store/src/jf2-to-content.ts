import { jf2ToContentWithFrontmatter, type JF2 } from '@jackdbd/micropub'
import { utf8ToBase64 } from './encoding.js'

/**
 * The GitHub Contents API requires content to be Base64-encoded.
 */
export const jf2ToContent = (jf2: JF2) => {
  const content = jf2ToContentWithFrontmatter(jf2)
  return utf8ToBase64(content)
}
