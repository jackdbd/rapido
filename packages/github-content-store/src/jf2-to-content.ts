import {
  isMpUrlencodedRequestBody,
  jf2ToContentWithFrontmatter
} from '@jackdbd/micropub'
import type { JF2ToContent, MP_Post_Type } from '@jackdbd/micropub'
import { utf8ToBase64 } from './encoding.js'

/**
 * The GitHub Contents API requires content to be Base64-encoded.
 */
export const jf2ToContent: JF2ToContent = (input) => {
  let post_type: MP_Post_Type
  if (isMpUrlencodedRequestBody(input)) {
    post_type = input.h || 'entry'
  } else {
    post_type = input.type || 'entry'
  }

  const jf2 = { ...input, type: post_type }
  return utf8ToBase64(jf2ToContentWithFrontmatter(jf2))
}
