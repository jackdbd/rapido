import {
  createOrUpdate,
  BASE_URL,
  GITHUB_TOKEN,
  REF
} from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import type { JF2, Publication } from '@jackdbd/micropub'
import type { UpdatePost } from '@jackdbd/micropub/schemas/user-provided-functions'
import { rfc3339 } from './date.js'
import { jf2ToContent } from './jf2-to-content.js'
import type { Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'
import { defWebsiteUrlToStoreLocation } from './website-url-to-store-location.js'

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
  token: GITHUB_TOKEN
}

export const defUpdate = (options?: Options) => {
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

  const update: UpdatePost = async (url, patch) => {
    const loc = websiteUrlToStoreLocation(url)

    // should we support updating a deleted post (loc.store_deleted)? Probably not.

    let jf2: JF2
    let sha: string
    try {
      const value = await retrieveContent(loc)
      if (!value.sha) {
        throw new Error(
          `Content retrieved from ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
        )
      }
      jf2 = value.jf2
      sha = value.sha
    } catch (ex: any) {
      const tip = `Make sure the file exists and that you can fetch it from the repository.`
      const error_description = `Cannot update the post published at ${loc.website} because the file ${loc.store} could not be retrieved from repository ${owner}/${repo} (branch ${branch}). ${tip}`
      throw new Error(error_description)
    }

    const messages: string[] = []

    if (patch.delete) {
      const { [patch.delete]: _, ...keep } = jf2 as any
      messages.push(`deleted property ${patch.delete}`)
      jf2 = keep
    }

    if (patch.add) {
      messages.push(`added ${JSON.stringify(patch.add)}`)
      jf2 = { ...jf2, ...patch.add }
    }

    if (patch.replace) {
      messages.push(`replaced ${JSON.stringify(patch.replace)}`)
      jf2 = { ...jf2, ...patch.replace }
    }

    if (patch.add || patch.delete || patch.replace) {
      jf2 = { ...jf2, updated: rfc3339() }
    }

    const content = jf2ToContent(jf2)

    const result = await createOrUpdate({
      author,
      base_url,
      branch,
      committer,
      content,
      owner,
      path: loc.store,
      repo,
      sha,
      token
    })

    // TODO: return update patch (a JSON object describing the changes that were
    // made), not the content itself.
    // https://micropub.spec.indieweb.org/#response-0-p-1

    if (result.error) {
      throw new Error(result.error.error_description)
    } else {
      const { status_code, status_text } = result.value
      const summary = `Updated ${loc.store} in repository ${owner}/${repo} (branch ${branch}). That post is published at ${loc.website}.`
      const payload = { messages, patch }
      return { status_code, status_text, summary, payload }
    }
  }

  return update
}
