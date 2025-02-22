import type { JF2_Application_JSON, UpdatePatch } from '@jackdbd/micropub'
import { apply, type Failure, type Success } from './effects.js'
import { log, Log } from './log.js'
import type { BaseProps, SyndicationTarget } from './syndication-targets/api.js'

export interface Config {
  canonicalUrl: URL
  jf2: JF2_Application_JSON
  targets: SyndicationTarget[]
}

const REQUIRED = ['canonicalUrl', 'jf2', 'targets'] as const

export interface Options {
  log?: Log
}

const defaults = {
  log
}

// apply all side effects to a single syndication target
const syndicateToTarget = async (
  canonicalUrl: URL,
  jf2: JF2_Application_JSON,
  target: SyndicationTarget
) => {
  const { uid, publish, publishArgs } = target

  const xs_props = publishArgs(canonicalUrl, jf2)

  const effects = xs_props.map((props, i) => {
    const args = [props] as [BaseProps]
    const detail = `application ${i + 1}/${xs_props.length}`
    const message = `will apply ${args.length} arguments to syndication target ${uid} (${detail})`
    log.debug(message)
    // log.debug(args, message)
    return { apply: publish, uid, args }
  })

  const { summary, failures, successes } = await apply(effects)

  return { summary, failures, successes, uid: target.uid }
}

export const syndicateJF2 = async (config: Config, options?: Options) => {
  REQUIRED.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Cannot syndicate: ${key} not set.`)
    }
  })

  const { canonicalUrl, jf2, targets } = config
  const { log } = Object.assign({}, defaults, options)

  const uids = targets.map((target) => target.uid)
  log.debug(`will syndicate JF2 to syndication target UIDs: ${uids.join(', ')}`)

  const syndications = await Promise.all(
    targets.map((target) => {
      return syndicateToTarget(canonicalUrl, jf2, target)
    })
  )

  const details: string[] = []
  const failures: Failure[] = []
  const successes: Success[] = []

  const update_patch: UpdatePatch = {
    // delete: 'mp-syndicated-to',
    replace: {
      'mp-syndicate-to': [],
      syndication: []
    }
  }

  const replace_mp_syndicate_to = new Set<string>(uids)
  const replace_syndication = new Set<string>()
  log.debug(
    {
      'mp-syndicate-to': [...replace_mp_syndicate_to],
      syndication: [...replace_syndication]
    },
    `update patch before`
  )

  syndications.forEach((syn, i) => {
    const summary = `syndication target ${i + 1}/${syndications.length} (uid: ${syn.uid}) had ${syn.failures.length} failures and ${syn.successes.length} successes`
    details.push(summary)
    log.info(summary)

    syn.failures.forEach((failure, j) => {
      const prefix = `${syn.uid} failure [${j + 1}/${syn.failures.length}] `
      replace_syndication.delete(syn.uid)
      replace_mp_syndicate_to.add(syn.uid)
      const { error } = failure
      log.error(`${prefix}${error.message}`)
    })

    syn.successes.forEach((_success, j) => {
      const prefix = `${syn.uid} success [${j + 1}/${syn.successes.length}] `
      // const { value } = success
      // log.debug(value, `${prefix}`)
      replace_syndication.add(syn.uid)
      replace_mp_syndicate_to.delete(syn.uid)
      log.debug(`${prefix}`)
    })
  })

  update_patch.replace['mp-syndicate-to'] = [...replace_mp_syndicate_to]
  update_patch.replace['syndication'] = [...replace_syndication]

  log.debug(
    {
      'mp-syndicate-to': [...replace_mp_syndicate_to],
      syndication: [...replace_syndication]
    },
    `update patch after`
  )

  return {
    summary: `Syndication completed`,
    details,
    update_patch,
    failures,
    successes
  }
}
