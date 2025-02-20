import type { Publication } from '@jackdbd/micropub'
import type { WebsiteUrlToStoreLocation } from '@jackdbd/micropub/schemas/user-provided-functions'
import { DEFAULT } from './defaults.js'
import type { Log } from './log.js'

interface Options {
  log?: Log
  name?: string
  publication: Publication
}

const defaults: Partial<Options> = {
  log: DEFAULT.log,
  name: DEFAULT.name
}

const REQUIRED = ['log', 'name', 'publication'] as const

export const defUrlToLocation = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { log, name, publication } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(
        `parameter '${k}' for '${name}' url-to-location is not set`
      )
    }
  })

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

  const urlToLocation: WebsiteUrlToStoreLocation = (url) => {
    const [_domain, ...splits] = url.split('/').slice(2)
    const slug = splits.filter((s) => s !== '').at(-1)

    // We need to create a new object each time.
    const loc = { ...publication.default.location }
    // This is not correct, because `loc` would be just a reference to the
    // `publication.default.location` object
    // const loc = publication.default.location

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

  return urlToLocation
}
