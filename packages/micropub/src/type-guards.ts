import type { JF2, MP_UrlencodedRequestBody } from './schemas/jf2.js'
import type { MF2, ParsedMF2 } from './schemas/mf2.js'

export function isMF2(body: unknown): body is MF2 {
  return (body as MF2).items !== undefined
}

export function isParsedMF2(body: unknown): body is ParsedMF2 {
  const b = body as ParsedMF2
  return (
    b.type !== undefined &&
    typeof b.type !== 'string' &&
    b.properties !== undefined
  )
}

export function isJF2(body: unknown): body is JF2 {
  const b = body as JF2
  return b.type !== undefined && typeof b.type === 'string'
}

export function isMpUrlencodedRequestBody(
  body: unknown
): body is MP_UrlencodedRequestBody {
  const b = body as MP_UrlencodedRequestBody
  return b.h !== undefined && typeof b.h === 'string'
}
