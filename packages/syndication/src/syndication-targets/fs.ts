import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { nanoid } from 'nanoid'
import { nop_log, EMOJI, type Log } from '@repo/stdlib'
import { contentHash } from '../content-hash.js'
import { defTexts } from '../telegram-texts.js'
import type { SyndicationTarget } from './api.js'

export interface Config {
  emoji?: Record<string, string>
  log?: Log
  name?: string
  root_path: string
  uid?: string
}

const defaults = {
  emoji: EMOJI,
  log: nop_log,
  name: 'Filesystem'
}

// required config+options after all defaults have been applied
const REQUIRED = ['emoji', 'log', 'name', 'root_path'] as const

export const defFilesystem = (config: Config): SyndicationTarget => {
  const cfg = Object.assign({}, defaults, config) as Required<Config>

  const { log, name, root_path, uid } = cfg

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(
        `Cannot create syndication target uid ${uid}: ${key} not set.`
      )
    }
  })

  const syndicateContent = async (text: string) => {
    const idempotencyKey = contentHash(text)
    const filename = `${nanoid()}.txt`
    const filepath = path.join(root_path, filename)
    // const texts = defTexts({ canonicalUrl, jf2 })
    const data = text + '\n'
    log.debug(`write ${filepath}`)
    await writeFile(filepath, data, { encoding: 'utf-8' })
    return { idempotencyKey, message: `wrote ${filepath}` }
  }

  return { jf2ToContents: defTexts, name, syndicateContent, uid }
}
