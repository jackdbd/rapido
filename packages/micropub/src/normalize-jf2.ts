import assert from 'node:assert'
import type { JF2_JSON, JF2_Urlencoded_Or_Multipart } from './schemas/jf2.js'

// type Value = number | string | Photo | number[] | string[] | Photo[]
type Value = number | string | any[]
type Entry = [string, Value]
type Acc = Record<string, Value>

/**
 * Convert a parsed `application/x-www-form-urlencoded` object into a JF2
 * object, or leave the input JF2 object as is.
 *
 * If a Micropub client makes a POST request with the
 * `Content-Type: application/x-www-form-urlencoded` header, we need to first
 * parse the request body, and then to normalize properties like
 * `syndicate-to[][0]`, `syndicate-to[][1]` into actual arrays.
 *
 * We need to call this function also then uploading more than one file to the
 * Media endpoint. In that scenario we might receive an urlencoded request, than
 * once parsed have these properties: `audio[]`, `video[]`, and `photo[]`.
 *
 * If `input` is already a JF2 object, this function will not alter it.
 */
export const normalizeJf2 = (input: JF2_Urlencoded_Or_Multipart): JF2_JSON => {
  const tmp = Object.entries(input).reduce((acc, entry) => {
    const [key, value] = entry as Entry

    if (key.includes('[]')) {
      // console.log('=== entry ===', entry)
      const k = key.split('[]').at(0)!

      if (acc[k]) {
        assert.ok(Array.isArray(acc[k]), `This is not an array: ${acc[k]}`)
        // console.log(`update ${k} array`)
        if (Array.isArray(value)) {
          acc[k].push(...value)
        } else {
          acc[k].push(value)
        }
      } else {
        if (Array.isArray(value)) {
          // console.log(`set ${k}=${JSON.stringify(value)}`)
          acc[k] = value
        } else {
          // console.log(`set ${k} array`)
          acc[k] = [value]
        }
      }

      return acc
    } else {
      if (key === 'h') {
        return { ...acc, type: value }
      } else {
        return { ...acc, [key]: value }
      }
    }
  }, {} as Acc)

  const output = Object.entries(tmp).reduce((acc, entry) => {
    const [key, value] = entry as Entry

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return acc
      } else if (value.length === 1) {
        return { ...acc, [key]: value[0] }
      } else {
        return { ...acc, [key]: value }
      }
    } else {
      return { ...acc, [key]: value }
    }
  }, {} as Acc)

  return output satisfies JF2_JSON
}
