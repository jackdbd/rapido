import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { nanoid } from 'nanoid'
import { log } from '../log.js'
import { defTexts } from '../telegram-texts.js'
import type {
  Failure,
  PublishArgs,
  Success,
  SyndicationTarget,
  Config as SyndicationTargetConfig,
  Options as SyndicationTargetOptions
} from './api.js'

export interface Config extends SyndicationTargetConfig {
  root_path: string
}

export interface Options extends SyndicationTargetOptions {
  name?: string
}

const defaults = { log, name: 'Filesystem' }

// required config+options after all defaults have been applied
const REQUIRED = ['log', 'name', 'root_path'] as const

interface Props {
  filepath: string
  data: string
}

export const defFilesystem = (
  config: Config,
  options?: Options
): SyndicationTarget<Props> => {
  const cfg = Object.assign({}, config, defaults, options) as Required<
    Config & Options
  >

  const { log, name, root_path, uid } = cfg

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(
        `Cannot create syndication target uid ${uid}: ${key} not set.`
      )
    }
  })

  const publishArgs: PublishArgs<Props> = (canonicalUrl, jf2) => {
    const filename = `${nanoid()}.txt`
    const filepath = path.join(root_path, filename)
    const texts = defTexts({ canonicalUrl, jf2 })
    const data = texts.join('\n') + '\n'
    log.debug(`syndication to ${name} (uid: ${uid}) will write ${filepath}`)
    return [{ filepath, data }]
  }

  const publish = async (props: Props) => {
    const { filepath, data } = props
    log.debug(`write ${filepath}`)
    await writeFile(filepath, data, { encoding: 'utf-8' })

    const failures: Failure[] = []
    const successes: Success[] = []
    successes.push({ uid, value: filepath })

    const summary = [
      `Syndication to target ${uid} completed:`,
      `${successes.length} effects succeeded,`,
      `${failures.length} effects failed.`
    ].join(' ')

    return { summary, successes, failures }
  }

  return { uid, publishArgs, publish }
}
