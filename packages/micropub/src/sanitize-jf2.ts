import type { JF2 } from './schemas/jf2.js'

const SENSITIVE_PROPS = new Set(['access_token'])

/**
 * Properties that should be discarded from a JF2 object before persisting to
 * storage the information the JF2 object contains.
 *
 * - `access_token`: the information contained in the JF2 object could be
 *   publicly available (e.g. users might use a public GitHub repository as
 *   their content store), so we make sure we don't store any access token.
 * - `action`: no point in storing it in a content store.
 * - `h`: no point in storing it in a content store.
 * - `type`: no point in storing it in a content store.
 * - `mp-slug`: it's a Micropub server command, so we don't need to store it in
 * a content store.
 */
const NOT_USED_IN_CONTENT_STORE = new Set(['action', 'h', 'mp-slug', 'type'])

export const jf2WithNoSensitiveProps = (input: JF2) => {
  const output: JF2 = Object.entries(input).reduce((acc, [key, value]) => {
    if (SENSITIVE_PROPS.has(key)) {
      return acc
    } else {
      return { ...acc, [key]: value }
    }
  }, {})
  return output
}

export const jf2WithNoUselessProps = (input: JF2) => {
  const output: JF2 = Object.entries(input).reduce((acc, [key, value]) => {
    if (NOT_USED_IN_CONTENT_STORE.has(key)) {
      return acc
    } else {
      return { ...acc, [key]: value }
    }
  }, {})
  return output
}
