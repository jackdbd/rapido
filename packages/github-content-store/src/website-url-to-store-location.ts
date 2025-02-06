import type { Publication } from '@jackdbd/micropub'
import type { WebsiteUrlToStoreLocation } from '@jackdbd/micropub/schemas/user-provided-functions'
import { defaultLog, type Log } from './log.js'

interface Options {
  log?: Log
  publication: Publication
}

const defaults: Partial<Options> = {
  log: defaultLog
}

export const defWebsiteUrlToStoreLocation = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>
  const { log, publication } = config

  if (!publication) {
    throw new Error('publication is required')
  }

  // E.g. A note published on my website: https://www.giacomodebidda.com/notes/test-note/

  const websiteUrlToStoreLocation: WebsiteUrlToStoreLocation = (url) => {
    const [_domain, ...splits] = url.split('/').slice(2)
    const slug = splits.filter((s) => s !== '').at(-1)

    const loc = publication.default.location

    const keys = Object.keys(publication.items)
    log.debug(`supported publications: ${keys.join(', ')}`)

    for (const [key, item] of Object.entries(publication.items)) {
      const { location, predicate } = item
      if (predicate.website(url)) {
        log.debug(`matched predicate: ${key}`)
        loc.store = `${location.store}${slug}.md`
        loc.website = `${location.website}${slug}/`

        if (location.store_deleted) {
          loc.store_deleted = `${location.store_deleted}${slug}.md`
        } else {
          loc.store_deleted = undefined
        }

        break
      }
    }

    return loc
  }

  return websiteUrlToStoreLocation
}
