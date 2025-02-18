import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import {
  hardDelete,
  BASE_URL,
  GITHUB_TOKEN,
  REF
} from '@jackdbd/github-contents-api'
import type { Publication } from '@jackdbd/micropub'
import type { DeletePost } from '@jackdbd/micropub/schemas/user-provided-functions'
import type { Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'
import { defWebsiteUrlToStoreLocation } from './website-url-to-store-location.js'

export interface Options {
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
  token: GITHUB_TOKEN
}

export const defHardDelete = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, branch, committer, log, owner, publication, repo, token } =
    config

  const websiteUrlToStoreLocation = defWebsiteUrlToStoreLocation({
    log,
    publication
  })

  const retrieveContent = defRetrieveContent({
    base_url,
    owner,
    ref: branch,
    repo,
    token
  })

  const hardDeleteContent: DeletePost = async (url) => {
    const loc = websiteUrlToStoreLocation(url)

    let sha: string | undefined
    try {
      const value = await retrieveContent(loc) // as GetResponseBody
      sha = value.sha
    } catch (ex: any) {
      // In this case the original error message from the GitHub Contents API is
      // not that useful.
      // const { error_description: original } = result_get.error
      const tip = `Please make sure the post exists in the repository.`
      const error_description = `Cannot delete post published at ${loc.website} because it could not be retrieved from location ${loc.store} in repository ${owner}/${repo} (branch ${branch}). ${tip}`
      throw new Error(error_description)
    }

    if (!sha) {
      throw new Error(
        `Content retrieved from ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
      )
    }

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
      const details = [
        `The post was stored in repository ${owner}/${repo} (branch ${branch}) at ${loc.store}.`
      ]
      return { summary: `Deleted ${loc.website} (hard-delete).`, details }
    }
  }

  return hardDeleteContent
}
