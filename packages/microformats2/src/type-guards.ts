import type { MF2, ParsedMF2 } from './mf2.js'

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
