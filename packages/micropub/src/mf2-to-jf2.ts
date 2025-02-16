import { mf2tojf2referenced } from '@paulrobertlloyd/mf2tojf2'
import type { JF2 } from './schemas/jf2.js'
import type { MF2 } from './schemas/mf2.js'

export const mf2tTojf2 = async (mf2: MF2) => {
  //   const jf2 = mf2tojf2(mf2)
  try {
    const jf2_with_references = await mf2tojf2referenced(mf2)
    console.log('=== MF2 => JF2 conversion ===', {
      mf2,
      jf2_with_references
    })
    return { value: jf2_with_references as JF2 }
  } catch (err) {
    return { error: err as Error }
  }
}
