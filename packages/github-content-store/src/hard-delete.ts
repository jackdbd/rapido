import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import { hardDelete } from '@jackdbd/github-contents-api'
import type { DeletePost, UrlToLocation } from '@jackdbd/micropub/schemas/index'
import { DEFAULT } from './defaults.js'
import type { Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'

export interface Options {
  base_url?: string
  branch?: string
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
  branch: DEFAULT.branch,
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

export const defHardDelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    base_url,
    branch,
    committer,
    log,
    name,
    owner,
    repo,
    token,
    urlToLocation
  } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' for '${name}' hard-delete is not set`)
    }
  })

  const retrieveContent = defRetrieveContent({
    base_url,
    log,
    name,
    owner,
    ref: branch,
    repo,
    token
  })

  const hardDeleteContent: DeletePost = async (url) => {
    const loc = urlToLocation(url)

    const value = await retrieveContent(loc)
    if (!value.metadata || !value.metadata.sha) {
      throw new Error(
        `Content retrieved from file ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
      )
    }

    const sha = value.metadata.sha

    const result = await hardDelete({
      base_url,
      committer,
      owner,
      path: loc.store,
      repo,
      sha,
      token
    })

    if (result.error) {
      // The original error message from the GitHub Contents API is not that useful.
      const summary = `Cannot delete post published at ${loc.website} because it could not be deleted from location ${loc.store} in repository ${owner}/${repo} (branch ${branch}).`
      const suggestions = [
        `Make sure you have the permissions to delete files from the respository.`
      ]
      log.error(`${summary}. ${suggestions.join(' ')}`)
      throw new Error(`${summary}. ${suggestions.join(' ')}`)
    } else {
      const summary = `Deleted ${loc.website} (hard-delete).`
      const details = [
        `The post was stored in repository ${owner}/${repo} (branch ${branch}) at ${loc.store}.`
      ]
      return { summary, details }
    }
  }

  return hardDeleteContent
}
