import type { JF2, MP_UrlencodedRequestBody } from './schemas/jf2.js'
import type { MF2, ParsedMF2 } from './schemas/mf2.js'

/**
 * Validates whether input is MF2 or not.
 */
export function isMF2(input: unknown): input is MF2 {
  return (input as MF2).items !== undefined
}

/**
 * Validates whether input is MF2 JSON or not.
 *
 * **NOTE**: I am not sure whether a MF2 JSON must include a `type` property.
 * If not provided, I think MF2 JSON should be treated as having type=["entry"].
 */
export function isParsedMF2(input: unknown): input is ParsedMF2 {
  const obj = input as ParsedMF2
  return (
    obj.type !== undefined &&
    typeof obj.type !== 'string' &&
    obj.properties !== undefined
  )
}

/**
 * Validates whether input is a request body (parsed) from an
 * `application/x-www-form-urlencoded` Micropub request.
 */
export function isMpUrlencodedRequestBody(
  input: unknown,
  content_type?: string
): input is MP_UrlencodedRequestBody {
  const obj = input as MP_UrlencodedRequestBody
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
