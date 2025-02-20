import { createOrUpdate } from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import type {
  UpdatePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/index'
import { rfc3339 } from './date.js'
import { DEFAULT } from './defaults.js'
import { jf2ToContent } from './jf2-to-content.js'
import type { Log } from './log.js'
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
  urlToLocation: WebsiteUrlToStoreLocation
}

const defaults: Partial<Options> = {
  base_url: DEFAULT.base_url,
  branch: DEFAULT.branch,
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

export const defUpdate = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

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
    urlToLocation
  } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' for '${name}' update is not set`)
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

  const update: UpdatePost = async (url, patch) => {
    const loc = urlToLocation(url)

    // should we support updating a deleted post (loc.store_deleted)? Probably not.

    const value = await retrieveContent(loc)
    if (!value.metadata || !value.metadata.sha) {
      throw new Error(
        `Content retrieved from file ${loc.store} in repository ${owner}/${repo} (branch ${branch}) does not have a sha.`
      )
    }

    let jf2 = value.jf2
    const sha = value.metadata.sha

    const messages: string[] = []

    if (patch.delete) {
      const { [patch.delete]: _, ...keep } = jf2 as Record<string, unknown>
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

    const result = await createOrUpdate({
      author,
      base_url,
      branch,
      committer,
      content: jf2ToContent(jf2),
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
      const summary = `Cannot update file ${loc.store} in repository ${owner}/${repo} (branch ${branch}).`
      const suggestions = [
        `Make sure the file exists.`,
        `Make sure you are using a GitHub token that allows you to write content in repository ${owner}/${repo}.`
      ]
      log.error(`${summary} ${suggestions.join(' ')}`)
      throw new Error(`${summary} ${suggestions.join(' ')}`)
    } else {
      const contents_api_summary = result.value.summary
      const contents_api_response_body = result.value.body
      const summary = `Updated file ${loc.store} in repository ${owner}/${repo} (branch ${branch}).`
      return {
        summary,
        details: messages,
        other_details: {
          contents_api_response_body,
          contents_api_summary,
          patch
        }
      }
    }
  }

  return update
}
