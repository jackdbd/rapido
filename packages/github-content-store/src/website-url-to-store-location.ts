import type { Publication } from '@jackdbd/micropub'
import type { WebsiteUrlToStoreLocation } from '@jackdbd/micropub/schemas/user-provided-functions'
import { defaultLog, type Log } from './log.js'

interface Options {
  log?: Log
  name?: string
  publication: Publication
}

const defaults: Partial<Options> = {
  log: defaultLog,
  name: 'GitHub repository'
}

export const defWebsiteUrlToStoreLocation = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>
  const { log, name, publication } = config

  if (!publication) {
    throw new Error(`cannot create store '${name}': publication is required`)
  }

  const mp_posts = Object.keys(publication.items)
  if (mp_posts.length > 0) {
    log.debug(
      `store '${name}' supports mapping URL => store for ${mp_posts.length} Micropub post types: ${mp_posts.join(', ')}`
    )
  } else {
    log.warn(
      `store '${name}' supports mapping URL => store for NO Micropub post types`
    )
  }

  const websiteUrlToStoreLocation: WebsiteUrlToStoreLocation = (url) => {
    const [_domain, ...splits] = url.split('/').slice(2)
    const slug = splits.filter((s) => s !== '').at(-1)

    const loc = publication.default.location

    let matched = false
    for (const [key, item] of Object.entries(publication.items)) {
      const { location, predicate } = item
      if (predicate.website(url)) {
        matched = true
        loc.store = `${location.store}${slug}.md`
        loc.website = `${location.website}${slug}/`

        let log_msg = `The post at URL ${loc.website} is of type=${key}, so its location in the store ${name} is ${loc.store}`
        if (location.store_deleted) {
          loc.store_deleted = `${location.store_deleted}${slug}.md`
          log_msg = log_msg + ` (${loc.store_deleted} if deleted)`
        } else {
          loc.store_deleted = undefined
        }

        log.debug(log_msg)

        break
      }
    }

    if (!matched) {
      let log_msg = `The post at URL ${loc.website} is of a type that is not one of the ${mp_posts.length} Micropub post types supported by store ${name} (${mp_posts.join(', ')}), so its location in the store ${name} is ${loc.store}`
      if (loc.store_deleted) {
        log_msg = log_msg + ` (${loc.store_deleted} if deleted)`
      }
      log.debug(log_msg)
    }

    return loc
  }

  return websiteUrlToStoreLocation
}
