import { jf2ToSlug } from '@jackdbd/micropub'
import type { Jf2ToLocation, Location, Publication } from '@jackdbd/micropub'
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

export const defJf2ToLocation = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>
  const { log, name, publication } = config

  if (!publication) {
    throw new Error(`cannot create store '${name}': publication is required`)
  }

  const mp_posts = Object.keys(publication.items)
  if (mp_posts.length > 0) {
    log.debug(
      `store '${name}' supports mapping JF2 => Location (store,URL) for ${mp_posts.length} Micropub post types: ${mp_posts.join(', ')}`
    )
  } else {
    log.warn(
      `store '${name}' supports mapping JF2 => Location (store,URL) for NO Micropub post types`
    )
  }

  const jf2ToLocation: Jf2ToLocation = (jf2) => {
    const slug = jf2ToSlug(jf2)
    // log.debug(`store '${name}' generated this slug: ${slug}`)
    const filename = `${slug}.md`

    // TODO: what if a post type is supported, but the deleted posts of that
    // type are not? (e.g. allow creating type=event, but not deleting them).
    // Should we use a default location for the deleted posts of that type?
    // I guess this could be a configuration option of this factory function.
    const loc: Location = {
      store: `${publication.default.location.store}${filename}`,
      store_deleted: `${publication.default.location.store_deleted}${filename}`,
      website: `${publication.default.location.website}${slug}/`
    }

    let matched = false
    for (const [key, item] of Object.entries(publication.items)) {
      const { location, predicate } = item
      if (predicate.store(jf2)) {
        matched = true
        log.debug(`jf2 is a Micropub post of type=${key}`)
        loc.store = `${location.store}${filename}`
        loc.website = `${location.website}${slug}/`
        if (location.store_deleted) {
          loc.store_deleted = `${location.store_deleted}${filename}`
          log.debug(`store '${name}' supports deleting posts of type=${key}`)
        } else {
          // avoid using the default location for deleted posts (see comment
          // above and decide if this should be configurable)
          loc.store_deleted = undefined
          log.debug(
            `store '${name}' does NOT support deleting posts of type=${key}`
          )
        }
        log.info(`location for posts of type=${key} in store '${name}' is:`)
        log.info(JSON.stringify(loc, null, 2))
        break
      }
    }

    if (!matched) {
      if (mp_posts.length > 0) {
        log.debug(
          `jf2 is not one of the ${mp_posts.length} Micropub post types supported by store ${name} (${mp_posts.join(', ')})`
        )
      } else {
        log.warn(`store '${name}' supports NO Micropub post types`)
      }
      log.warn(`using the default location for posts in store '${name}':`)
      log.warn(JSON.stringify(loc, null, 2))
    }

    return loc
  }

  return jf2ToLocation
}
