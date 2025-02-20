import type {
  DeletePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { move } from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
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
  urlToLocation: WebsiteUrlToStoreLocation
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

export const defSoftDelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, committer, log, name, owner, repo, token, urlToLocation } =
    config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' for '${name}' soft-delete is not set`)
    }
  })

  const softDelete: DeletePost = async (url) => {
    const loc = urlToLocation(url)

    if (!loc.store_deleted) {
      const error_description = `Cannot soft-delete ${loc.website} because it does not specify a location for when it's deleted`
      log.error(error_description)
      throw new Error(error_description)
    }

    const result = await move({
      base_url,
      committer,
      path_before: loc.store,
      path_after: loc.store_deleted,
      owner,
      repo,
      token
    })
    console.log('=== move (soft-delete) result ===', result)

    if (result.error) {
      throw new Error(result.error.error_description)
    } else {
      const summary = `Deleted ${loc.website} (soft-delete).`
      // Do we know the branch/ref in this function? In the hard-delete we do.
      const details = [
        `The post stored in repository ${owner}/${repo} was moved from ${loc.store} to ${loc.store_deleted}.`
      ]
      return { summary, details }
    }
  }

  return softDelete
}
