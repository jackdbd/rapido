import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import type { Publication } from '@jackdbd/micropub'
import { defCreate } from './create.js'
import { DEFAULT } from './defaults.js'
import { defHardDelete } from './hard-delete.js'
import { defJf2ToLocation } from './jf2-to-location.js'
import { jf2ToContent } from './jf2-to-content.js'
import type { Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'
import { defSoftDelete } from './soft-delete.js'
import { defUndelete } from './undelete.js'
import { defUpdate } from './update.js'
import { defUrlToLocation } from './url-to-location.js'

/**
 * Configuration options for the GitHub store.
 *
 * **Note**: We could retrieve name and email from the GitHub token by making an
 * authenticated request to https://api.github.com/user, but then we would need
 * to `await` the function that creates the store.
 */
export interface Config {
  author?: AuthorOrCommitter
  branch?: string
  committer: AuthorOrCommitter
  github_api_base_url?: string
  log?: Log
  name?: string
  owner: string
  publication: Publication
  repo: string
  soft_delete?: boolean
  token?: string
}

const defaults: Partial<Config> = {
  branch: DEFAULT.branch,
  github_api_base_url: DEFAULT.base_url,
  log: DEFAULT.log,
  soft_delete: DEFAULT.soft_delete,
  token: DEFAULT.token
}

const REQUIRED = [
  'committer',
  'log',
  'owner',
  'publication',
  'repo',
  'token'
] as const

export const defGitHub = (config: Config) => {
  const store_cfg = Object.assign({}, defaults, config) as Required<Config>

  const {
    branch,
    committer,
    github_api_base_url: base_url,
    log,
    owner,
    publication,
    repo,
    token
  } = store_cfg

  REQUIRED.forEach((k) => {
    if (!store_cfg[k]) {
      throw new Error(`parameter '${k}' for GitHub client is not set`)
    }
  })

  const author = config.author || committer

  const name = store_cfg.name || `GitHub repository ${owner}/${repo}`

  const info = {
    author,
    branch,
    committer,
    name,
    publication
  }

  const jf2ToLocation = defJf2ToLocation({
    log,
    name,
    publication
  })

  const urlToLocation = defUrlToLocation({
    log,
    name,
    publication
  })

  const create = defCreate({
    author,
    base_url,
    branch,
    committer,
    jf2ToLocation,
    log,
    owner,
    repo,
    token
  })

  const update = defUpdate({
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

  const hardDelete = defHardDelete({
    base_url,
    branch,
    committer,
    log,
    owner,
    repo,
    token,
    urlToLocation
  })

  const softDelete = defSoftDelete({
    base_url,
    committer,
    log,
    owner,
    repo,
    token,
    urlToLocation
  })

  const undelete = defUndelete({
    base_url,
    committer,
    log,
    owner,
    repo,
    token,
    urlToLocation
  })

  return {
    create,
    delete: store_cfg.soft_delete ? softDelete : hardDelete,
    jf2ToContent,
    jf2ToLocation,
    info,
    retrieveContent,
    undelete: store_cfg.soft_delete ? undelete : undefined,
    update,
    urlToLocation
  }
}
