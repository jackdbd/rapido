import { DEFAULT as API_CLIENT_DEFAULT } from '@jackdbd/github-contents-api'
import type { Log } from './log.js'

export const log: Log = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

// export const log: Log = console

export const DEFAULT = {
  base_url: API_CLIENT_DEFAULT.base_url,
  branch: API_CLIENT_DEFAULT.branch,
  // https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
  github_contents_api_version: API_CLIENT_DEFAULT.api_version,
  log,
  name: 'GitHub repository',
  ref: API_CLIENT_DEFAULT.ref,
  soft_delete: false,
  token: API_CLIENT_DEFAULT.token
}
