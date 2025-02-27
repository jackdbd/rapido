import type { JF2_Application_JSON } from '@jackdbd/micropub'
import { fetchWithManualRedirects, log, type Log } from '@repo/stdlib'
import type { SyndicationTarget } from './syndication-targets/api.js'
import { syndicateJF2 } from './syndicate-jf2.js'
import { syndicateHTML } from './syndicate-html.js'

export interface Config {
  html?: string
  jf2?: JF2_Application_JSON
  log?: Log
  maxRedirects?: number
  targets: SyndicationTarget[]
  url: URL
}

const defaults = {
  log,
  maxRedirects: 20
}

// required config after all defaults have been applied
const REQUIRED = ['log', 'targets', 'url'] as const

export const syndicate = async (config: Config) => {
  const cfg = Object.assign({}, defaults, config)

  const { html, jf2, log, maxRedirects, targets, url } = cfg

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(`Cannot syndicate: ${key} not set.`)
    }
  })

  if (jf2) {
    // If JF2 is provided, we assume that url is the canonical URL
    return syndicateJF2({ canonicalUrl: url, jf2, targets }, { log })
  }

  if (html) {
    // If HTML is provided, it could be an entire page or a small snippet (e.g.
    // a Micropub note), so we can either:
    // - let the `syndicateHTML` function check for the presence of a canonical
    //   URL in the HTML, or
    // - tell `syndicateHTML` to skip validating the canonical URL and just use
    //   the one we provide in the options.
    return syndicateHTML(
      { baseUrl: url, html, targets },
      { canonicalUrl: url, log }
    )
  }

  const response = await fetchWithManualRedirects(url, {
    log,
    maxRedirects
  })

  if (!response.ok) {
    throw new Error(
      `Cannot syndicate ${url.href}: fetch failed (${response.statusText})`
    )
  }

  const text = await response.text()

  // Here we have actually fetched an entire HTML page, so we let the
  // `syndicateHTML` extract the canonical URL from the HTML.
  return syndicateHTML({ baseUrl: url, html: text, targets }, { log })
}
