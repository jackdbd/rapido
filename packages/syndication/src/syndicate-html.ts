import { mf2tTojf2, type JF2_Application_JSON } from '@jackdbd/micropub'
import { mf2 } from 'microformats-parser'
import { log, type Log } from '@repo/stdlib'
import type { SyndicationTarget } from './syndication-targets/api.js'
import { syndicateJF2 } from './syndicate-jf2.js'

export interface Config {
  baseUrl: URL
  html: string
  targets: SyndicationTarget[]
}

const REQUIRED = ['baseUrl', 'html', 'targets'] as const

export interface Options {
  canonicalUrl?: URL
  log?: Log
}

const defaults = {
  log
}

export const syndicateHTML = async (config: Config, options?: Options) => {
  REQUIRED.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Cannot syndicate: ${key} not set.`)
    }
  })

  const { baseUrl, html, targets } = config
  const opt = Object.assign({}, defaults, options)
  const { log } = opt

  // JSON representation of Microformats 2
  // https://github.com/microformats/microformats-parser
  const mf2_json = mf2(html, {
    baseUrl: baseUrl.href
    // experimental: { metaformats: true, textContent: true }
  })

  log.debug(`parsed HTML microformats2 into MF2 JSON`)

  let canonicalUrl = opt.canonicalUrl
  if (canonicalUrl) {
    log.warn(`canonical URL provided in options: ${canonicalUrl.href}`)
  } else {
    if (
      !mf2_json.rels.canonical ||
      mf2_json.rels.canonical.length === 0 ||
      !mf2_json.rels.canonical[0]
    ) {
      throw new Error(`Cannot syndicate: no canonical URL found in MF2 JSON.`)
    }

    if (mf2_json.rels.canonical.length > 1) {
      log.warn(
        `MF2 JSON contains more than one canonical URL; using the first one`
      )
    }

    canonicalUrl = new URL(mf2_json.rels.canonical[0])
    log.info(`canonical URL found in MF2 JSON: ${canonicalUrl.href}`)
  }

  const res = await mf2tTojf2(mf2_json as any)

  if (res.error) {
    throw new Error(
      `Cannot syndicate: cannot convert MF2 JSON into JF2: ${res.error.message}`
    )
  }

  const jf2 = res.value satisfies JF2_Application_JSON
  log.debug(`converted MF2 JSON into JF2`)

  return syndicateJF2({ canonicalUrl, jf2, targets }, { log })
}
