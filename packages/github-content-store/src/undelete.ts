import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import { move } from '@jackdbd/github-contents-api'
import type {
  UndeletePost,
  UrlToLocation
} from '@jackdbd/micropub/schemas/index'
import { DEFAULT } from './defaults.js'
import type { Log } from './log.js'

export interface Options {
  base_url?: string
  committer: AuthorOrCommitter
  log?: Log
  name?: string
  owner: string
  repo: string
  token?: string
  urlToLocation: UrlToLocation
}

const defaults: Partial<Options> = {
  base_url: DEFAULT.base_url,
  log: DEFAULT.log,
  name: DEFAULT.name,
  token: DEFAULT.token
}

const REQUIRED = [
  'committer',
  'log',
  'name',
  'owner',
  'repo',
  'token',
  'urlToLocation'
] as const

export const defUndelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, committer, log, name, owner, repo, token, urlToLocation } =
    config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' for '${name}' undelete is not set`)
    }
  })

  const undelete: UndeletePost = async (url) => {
    const loc = urlToLocation(url)

    if (!loc.store_deleted) {
      const message = `Cannot undelete post published at ${loc.website} because it does not specify a location for when it's deleted.`
      // I guess this should be considered a 409 Conflict
      log.error(message)
      throw new Error(message)
    }

    const result = await move({
      base_url,
      committer,
      path_before: loc.store_deleted,
      path_after: loc.store,
      owner,
      repo,
      token
    })
    console.log('=== move (undelete) result ===', result)

    if (result.error) {
      const { error_description: original } = result.error
      const message = `Cannot undelete post published at ${loc.website}. ${original}`
      throw new Error(message)
    } else {
      const details = [
        `A file stored in repository ${owner}/${repo} was moved from ${loc.store_deleted} to ${loc.store}.`
      ]
      return { summary: `Undeleted ${loc.website}.`, details }
    }
  }

  return undelete
}
