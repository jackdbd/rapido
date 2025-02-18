import {
  BASE_URL as GITHUB_API_BASE_URL,
  REF
} from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import type { Publication } from '@jackdbd/micropub'
import { defCreatePost } from './create-content.js'
import { defHardDelete } from './hard-delete.js'
import { defJf2ToLocation } from './jf2-to-location.js'
import { jf2ToContent } from './jf2-to-content.js'
import { defaultLog, type Log } from './log.js'
import { defRetrieveContent } from './retrieve-content.js'
import { defSoftDelete } from './soft-delete.js'
import { defUndelete } from './undelete.js'
import { defUpdate } from './update.js'
import { defWebsiteUrlToStoreLocation } from './website-url-to-store-location.js'

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
  owner: string
  publication: Publication
  repo: string
  soft_delete: boolean
  token?: string
}

const defaults: Partial<Config> = {
  branch: REF,
  github_api_base_url: GITHUB_API_BASE_URL,
  log: defaultLog,
  token: process.env.GITHUB_TOKEN
}

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

  const author = config.author || committer

  const store_name = `GitHub repository ${owner}/${repo}`

  const info = {
    author,
    branch,
    committer,
    name: store_name,
    publication
  }

  const jf2ToLocation = defJf2ToLocation({
    log,
    name: store_name,
    publication
  })

  const websiteUrlToStoreLocation = defWebsiteUrlToStoreLocation({
    log,
    name: store_name,
    publication
  })

  const create = defCreatePost({
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
    owner,
    repo,
    token,
    websiteUrlToStoreLocation
  })

  const retrieveContent = defRetrieveContent({
    base_url,
    log,
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
    websiteUrlToStoreLocation
  })

  const softDelete = defSoftDelete({
    base_url,
    committer,
    log,
    owner,
    repo,
    token,
    websiteUrlToStoreLocation
  })

  const undelete = defUndelete({
    base_url,
    committer,
    log,
    owner,
    repo,
    token,
    websiteUrlToStoreLocation
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
    websiteUrlToStoreLocation
  }
}
