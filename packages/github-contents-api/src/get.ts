import type { SharedConfig } from './config.js'
import { BASE_URL, REF } from './defaults.js'
import { internalServerError } from './errors.js'
import { defHeaders } from './headers.js'
import { defaultLog, type Log } from './log.js'

export interface GetResponseBody {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content: string
  encoding: 'base64'
  _links: {
    self: string
    git: string
    html: string
  }
}

export interface GetOptions extends SharedConfig {
  log?: Log

  /**
   * If you omit the path parameter, you will receive the contents of the repository's root directory.
   */
  path?: string

  /**
   * The name of the commit/branch/tag.
   */
  ref?: string
}

const defaults: Partial<GetOptions> = {
  base_url: BASE_URL,
  log: defaultLog,
  path: '',
  ref: REF
}

/**
 * Gets the contents of a file or directory in a repository.
 *
 * @see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
 */
export const get = async (options: GetOptions) => {
  const config = Object.assign({}, defaults, options) as Required<GetOptions>

  const { base_url, log, owner, path, ref, repo, token } = config

  const endpoint = `/repos/${owner}/${repo}/contents/${path}`
  const url = `${base_url}${endpoint}?ref=${ref}`

  let response: Response
  try {
    log.debug(`GET ${url}`)
    response = await fetch(url, {
      method: 'GET',
      headers: defHeaders({ token })
    })
  } catch (ex: any) {
    log.error(`GET ${url} errored: ${ex.message}`)
    return {
      error: internalServerError(ex)
    }
  }

  if (!response.ok) {
    return {
      error: {
        error_description: `cannot retrieve ${config.path} from repo ${owner}/${repo}, ref=${ref}`,
        status_code: response.status,
        status_text: response.statusText
      }
    }
  }

  try {
    const body: GetResponseBody = await response.json()
    // TODO: maybe consider returning just the link/url/permalink/location
    // instead of the entire response body.
    return {
      value: {
        summary: `retrieved ${config.path} from repo ${owner}/${repo}, ref=${ref}`,
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
