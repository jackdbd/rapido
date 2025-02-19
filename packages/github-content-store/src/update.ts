import {
  createOrUpdate,
  BASE_URL,
  GITHUB_TOKEN,
  REF
} from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
// import type { JF2 } from '@jackdbd/micropub'
import type {
  UpdatePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { rfc3339 } from './date.js'
import { jf2ToContent } from './jf2-to-content.js'
import { defaultLog, type Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'

export interface Options {
  author?: AuthorOrCommitter
  base_url?: string
  branch?: string
  committer: AuthorOrCommitter
  log?: Log
  name?: string
  owner: string
  repo: string
  token?: string
  websiteUrlToStoreLocation: WebsiteUrlToStoreLocation
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  branch: REF,
  log: defaultLog,
  name: 'GitHub repository',
  token: GITHUB_TOKEN
}

const REQUIRED = [
  'committer',
  'log',
  'owner',
  'repo',
  'token',
  'websiteUrlToStoreLocation'
] as const

export const defUpdate = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' is required`)
    }
  })

  const {
    author,
    base_url,
    branch,
    committer,
    log,
    name,
    owner,
    repo,
    token,
    websiteUrlToStoreLocation
  } = config

  if (!log) {
    throw new Error(`parameter 'log' for store '${name}' not set`)
  }

  if (!token) {
    throw new Error(`parameter 'token' for store '${name}' not set`)
  }

  const retrieveContent = defRetrieveContent({
    base_url,
    log,
    owner,
    ref: branch,
    repo,
    token
  })

  const update: UpdatePost = async (url, patch) => {
    const loc = websiteUrlToStoreLocation(url)

    // should we support updating a deleted post (loc.store_deleted)? Probably not.

    const value = await retrieveContent(loc)
    if (!value.sha) {
      throw new Error(
        `Content retrieved from ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
      )
    }
    let jf2 = value.jf2
    const sha = value.sha

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
      const summary = `Cannot update ${loc.store} in repository ${owner}/${repo} (branch ${branch}).`
      const suggestions = [
        `Make sure the file exists.`,
        `Make sure you are using a GitHub token that allows you to write content in repository ${owner}/${repo}.`
      ]
      log.error(`${summary} ${suggestions.join(' ')}`)
      throw new Error(`${summary} ${suggestions.join(' ')}`)
    }
    // TODO: return at least a summary, maybe also the updated jf2
    // else {
    //   const { status_code, status_text } = result.value
    //   const summary = `Updated ${loc.store} in repository ${owner}/${repo} (branch ${branch}). That post is published at ${loc.website}.`
    //   const payload = { messages, patch }
    //   return { status_code, status_text, summary, payload }
    // }
  }

  return update
}
