import type { AuthorOrCommitter, SharedConfig } from './config.js'
import { BASE_URL, REF } from './defaults.js'
import { internalServerError } from './errors.js'
import { defHeaders } from './headers.js'
import { defaultLog, type Log } from './log.js'

export interface CreateOrUpdateOptions extends SharedConfig {
  author?: AuthorOrCommitter
  branch?: string
  committer: AuthorOrCommitter
  content: string // Base64-encoded content
  log?: Log
  path: string
  sha?: string
}

const defaults: Partial<CreateOrUpdateOptions> = {
  base_url: BASE_URL,
  branch: REF,
  log: defaultLog,
  path: ''
}

/**
 * Creates a new file or replaces an existing file in a repository.
 *
 * @see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents
 */
export const createOrUpdate = async (options: CreateOrUpdateOptions) => {
  const config = Object.assign(
    {},
    defaults,
    options
  ) as Required<CreateOrUpdateOptions>

  const {
    base_url,
    branch,
    committer,
    content,
    log,
    owner,
    path,
    repo,
    sha,
    token
  } = config
  const author = config.author || committer

  const endpoint = `/repos/${owner}/${repo}/contents/${path}`
  const url = `${base_url}${endpoint}`

  const shared = {
    author,
    branch,
    owner,
    repo,
    path,
    committer,
    content
  }

  let body: Record<string, any>
  if (sha) {
    body = { ...shared, message: `update ${path}`, sha }
  } else {
    body = { ...shared, message: `create ${path}` }
  }

  console.log(`=== debug github-contents-api create-or-update ===`, {
    body,
    token,
    url,
    sha
  })

  let response: Response
  try {
    log.debug(`PUT ${url}`)
    response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: defHeaders({ token })
    })
  } catch (ex: any) {
    log.error(`PUT ${url} errored: ${ex.message}`)
    return {
      error: internalServerError(ex)
    }
  }

  if (sha && response.status !== 200) {
    log.error(`sha=${sha} and response.status=${response.status}`)
    return {
      error: {
        error_description: `could not update ${config.path} in repo ${owner}/${repo}`,
        status_code: response.status,
        status_text: response.statusText
      }
    }
  }

  if (!sha && response.status !== 201) {
    log.error(`response.status=${response.status} and sha is undefined`)
    return {
      error: {
        error_description: `could not create ${config.path} in repo ${owner}/${repo}`,
        status_code: response.status,
        status_text: response.statusText
      }
    }
  }

  let summary: string
  if (sha) {
    summary = `updated ${config.path} in repo ${owner}/${repo}`
  } else {
    summary = `created ${config.path} in repo ${owner}/${repo}`
  }

  try {
    log.debug(`parse JSON response from ${url}`)
    const body = await response.json()
    // TODO: maybe consider returning just the link/url/permalink/location
    // instead of the entire response body.
    return {
      value: {
        summary,
        body,
        status_code: response.status,
        status_text: response.statusText
      }
    }
  } catch (ex: any) {
    log.error(`cannot parse JSON response: ${ex.message}`)
    return {
      error: internalServerError(ex)
    }
  }
}
