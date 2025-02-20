import type { MF2 } from '@jackdbd/microformats2'
import { mf2tojf2referenced } from '@paulrobertlloyd/mf2tojf2'
import type { JF2 } from './schemas/jf2.js'

interface Payload {
  message: string
  mf2: MF2
  jf2: JF2 // can this be only JF2_JSON or also JF2_Urlencoded_Or_Multipart?
}

interface Options {
  log?: (payload: Payload) => void
}

// const defaults = {
//   log: (payload: Payload) => {
//     console.log(payload.message)
//     console.log('MF2')
//     console.log(JSON.stringify(payload.mf2, null, 2))
//     console.log('JF2')
//     console.log(JSON.stringify(payload.jf2, null, 2))
//   }
// }

const defaults = {
  log: (_payload: Payload) => {}
}

export const mf2tTojf2 = async (mf2: MF2, options?: Options) => {
  const config = Object.assign({}, defaults, options)
  const { log } = config

  // const jf2 = mf2tojf2(mf2)
  // log({ message: 'MF2 => JF2 (not referenced)', mf2, jf2 })

  try {
    const jf2_with_references = await mf2tojf2referenced(mf2)
    log({ message: 'MF2 => JF2 (referenced)', mf2, jf2: jf2_with_references })
    return { value: jf2_with_references as JF2 }
  } catch (err) {
    return { error: err as Error }
  }
}
