import type { DeletePost } from '@jackdbd/micropub/schemas/user-provided-functions'
import { move, BASE_URL, GITHUB_TOKEN } from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import type { Publication } from '@jackdbd/micropub'
import type { Log } from './log.js'
import { defWebsiteUrlToStoreLocation } from './website-url-to-store-location.js'

export interface Options {
  base_url?: string
  committer: AuthorOrCommitter
  log?: Log
  owner?: string
  publication: Publication
  repo?: string
  token?: string
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  token: GITHUB_TOKEN
}

export const defSoftDelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, committer, log, owner, publication, repo, token } = config

  const websiteUrlToStoreLocation = defWebsiteUrlToStoreLocation({
    log,
    publication
  })

  const softDelete: DeletePost = async (url) => {
    const loc = websiteUrlToStoreLocation(url)

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
      return loc
    }
  }

  return softDelete
}
