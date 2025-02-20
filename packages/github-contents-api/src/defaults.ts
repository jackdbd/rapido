import type { Log } from './log.js'

const log: Log = {
  debug: () => {},
  error: () => {}
}

export const DEFAULT = {
  accept: 'application/vnd.github+json',
  // https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
  api_version: '2022-11-28',
  base_url: 'https://api.github.com',
  branch: 'main',
  log,
  path: '',
  ref: 'main',
  token: process.env.GITHUB_TOKEN
}
