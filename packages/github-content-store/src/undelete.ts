import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import { move, BASE_URL, GITHUB_TOKEN } from '@jackdbd/github-contents-api'
import type {
  UndeletePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import type { Log } from './log.js'

export interface Options {
  base_url?: string
  committer: AuthorOrCommitter
  log?: Log
  owner?: string
  repo?: string
  token?: string
  websiteUrlToStoreLocation: WebsiteUrlToStoreLocation
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  token: GITHUB_TOKEN
}

export const defUndelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    base_url,
    committer,
    log,
    owner,
    repo,
    token,
    websiteUrlToStoreLocation
  } = config

  const undelete: UndeletePost = async (url) => {
    const loc = websiteUrlToStoreLocation(url)

    if (!loc.store_deleted) {
      const error_description = `Cannot undelete post published at ${loc.website} because it does not specify a location for when it's deleted.`
      log.error(error_description)
      //   { status_code: 409, status_text: 'Conflict', error_description }
      throw new Error(error_description)
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
        `The post stored in repository ${owner}/${repo} was moved from ${loc.store_deleted} to ${loc.store}.`
      ]
      return { summary: `Undeleted ${loc.website}.`, details }
    }
  }

  return undelete
}
