import { isMF2, isParsedMF2 } from '@jackdbd/microformats2'
import type { JF2, JF2_Urlencoded_Or_Multipart } from './schemas/jf2.js'

/**
 * Validates whether input is a request body (parsed) from an
 * `application/x-www-form-urlencoded` Micropub request.
 */
export function isMpUrlencodedRequestBody(
  input: unknown,
  content_type?: string
): input is JF2_Urlencoded_Or_Multipart {
  const obj = input as JF2_Urlencoded_Or_Multipart
  let h: string | undefined = undefined
  if (content_type) {
    if (content_type.includes('application/json')) {
      return false
    }
    if (content_type.includes('application/x-www-form-urlencoded')) {
      h = obj.h || 'entry'
    }
  } else {
    // If content_type is not provided, we cannot assume it's an urlencoded
    // request, so we don't assign a default value to `h`.
    h = obj.h
  }
  return h !== undefined && typeof h === 'string'
}

/**
 * Validates whether input is JF2 or not.
 *
 * **NOTE**: an empty object is valid JF2, it does not have to include a `type`
 * property. If not provided, JF2 should be treated as having type=entry.
 *
 * @see [JF2 validator](https://validator.jf2.rocks/)
 * @see [JF2 Post Serialization Format](https://jf2.spec.indieweb.org/)
 */
export function isJF2(input: unknown, content_type?: string): input is JF2 {
  return (
    !isMF2(input) &&
    !isParsedMF2(input) &&
    !isMpUrlencodedRequestBody(input, content_type)
  )
}
