import { jf2ToSlug } from '@jackdbd/micropub'
import type { Jf2ToWebsiteUrl, Location, Publication } from '@jackdbd/micropub'
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

export const defJf2ToWebsiteUrl = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>
  const { log, name, publication } = config

  if (!publication) {
    throw new Error('publication is required')
  }

  const mp_posts = Object.keys(publication.items)
  log.debug(
    `store ${name} supports JF2 => URL for these Micropub post types: ${mp_posts.join(', ')}`
  )

  const jf2ToWebsiteUrl: Jf2ToWebsiteUrl = (jf2) => {
    const slug = jf2ToSlug(jf2)
    log.debug(`generated slug for store ${name}: ${slug}`)
    const filename = `${slug}.md`

    const loc: Location = {
      store: `${publication.default.location.store}${filename}`,
      website: `${publication.default.location.website}${slug}/`
    }

    let matched = false
    for (const [key, item] of Object.entries(publication.items)) {
      const { location, predicate } = item
      if (predicate.store(jf2)) {
        matched = true
        loc.store = `${location.store}${filename}`
        loc.website = `${location.website}${slug}/`
        log.debug(
          `jf2 is a post of type=${key}, so it will be published to ${loc.website}`
        )
        break
      }
    }

    if (!matched) {
      log.debug(
        `using default location (${loc.website}), since jf2 is not one of the ${mp_posts.length} Micropub post types supported by store ${name} (${mp_posts.join(', ')})`
      )
    }

    return loc.website
  }

  return jf2ToWebsiteUrl
}
