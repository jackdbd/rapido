import {
  createOrUpdate,
  BASE_URL,
  GITHUB_TOKEN,
  REF
} from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import { jf2ToSlug } from '@jackdbd/micropub'
import type { Location, Publication } from '@jackdbd/micropub'
import type { CreatePost } from '@jackdbd/micropub/schemas/user-provided-functions'
import { jf2ToContent } from './jf2-to-content.js'
import { defaultLog, type Log } from './log.js'

export interface Options {
  author?: AuthorOrCommitter
  base_url?: string
  branch?: string
  committer: AuthorOrCommitter
  log?: Log
  owner?: string
  publication: Publication
  repo?: string
  token?: string
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  branch: REF,
  log: defaultLog,
  token: GITHUB_TOKEN
}

export const defCreate = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    author,
    base_url,
    branch,
    committer,
    log,
    owner,
    publication,
    repo,
    token
  } = config

  const create: CreatePost = async (jf2) => {
    const content = jf2ToContent(jf2)
    const slug = jf2ToSlug(jf2)
    const filename = `${slug}.md`

    const loc: Location = {
      store: `${publication.default.location.store}${filename}`,
      website: `${publication.default.location.website}${slug}/`
    }

    const keys = Object.keys(publication.items)
    log.debug(`supported publications: ${keys.join(', ')}`)

    for (const [key, item] of Object.entries(publication.items)) {
      const { location, predicate } = item
      if (predicate.store(jf2)) {
        log.debug(`matched predicate: ${key}`)
        loc.store = `${location.store}${filename}`
        loc.website = `${location.website}${slug}/`
        break
      }
    }

    // TODO: if the `me` website already has a post with the same slug as the
    // one suggested suggested with `mp-slug`, we could regenerate a new slug
    // (maybe with an UUID) and try again. We would need to know the matching
    // URL => location in store and website. We could put the for loop above in
    // a function that takes `publication` and outputs `loc`.
    // We would also need to know whether the content is HTML or plain text, so
    // we can use the correct file extension when saving the file in the store.
    // See also: https://indieweb.org/Micropub-extensions#Slug

    log.debug(
      `trying to store ${jf2.type} as base64-encoded string at ${loc.store}`
    )

    const result = await createOrUpdate({
      author,
      base_url,
      branch,
      committer,
      content,
      log,
      owner,
      path: loc.store,
      repo,
      token
    })

    if (result.error) {
      // The original error message from the GitHub Contents API is not that useful.
      const summary = `Cannot create ${loc.store} in repository ${owner}/${repo}.`
      const suggestions = [`Make sure there isn't already a file at that path.`]
      log.error(`${summary}. ${suggestions.join(' ')}`)
      throw new Error(`${summary}. ${suggestions.join(' ')}`)
    } else {
      const summary = `Post ot type '${jf2.type}' created at ${loc.store} in repo ${owner}/${repo} on branch ${branch}. Committed by ${committer.name} (${committer.email}). The post will be published at ${loc.website}.`
      log.debug(summary)
      return loc
    }
  }

  return create
}
