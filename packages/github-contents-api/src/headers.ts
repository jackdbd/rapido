import { DEFAULT } from './defaults.js'

export interface Options {
  accept?: string
  api_version?: string
  token?: string
}

const defaults = {
  accept: DEFAULT.accept,
  api_version: DEFAULT.api_version,
  token: DEFAULT.token
}

export const defHeaders = (options?: Options) => {
  const config = Object.assign({}, defaults, options)

  const { accept, api_version, token } = config

  if (!token) {
    throw new Error('GitHub token not set')
  }

  return {
    accept,
    authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': api_version
  }
}
