import type { RetrievePost } from '@jackdbd/micropub/schemas/index'
import { get } from '@jackdbd/github-contents-api'
import { DEFAULT } from './defaults.js'
import { base64ToUtf8 } from './encoding.js'
import type { Log } from './log.js'
import { markdownToJf2 } from './markdown-to-jf2.js'

export interface Options {
  base_url?: string
  log?: Log
  name?: string
  owner: string
  ref?: string
  repo: string
  token?: string
}

const defaults: Partial<Options> = {
  base_url: DEFAULT.base_url,
  log: DEFAULT.log,
  name: DEFAULT.name,
  ref: DEFAULT.ref,
  token: DEFAULT.token
}

const REQUIRED = ['log', 'name', 'owner', 'repo', 'token'] as const

export const defRetrieveContent = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, log, name, owner, ref, repo, token } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(
        `parameter '${k}' for '${name}' retrieve-content is not set`
      )
    }
  })

  const retrieveContent: RetrievePost = async (loc) => {
    const result = await get({
      base_url,
      owner,
      path: loc.store,
      ref,
      repo,
      token
    })

    if (result.error) {
      const summary = `Cannot retrieve file ${loc.store} from repository ${owner}/${repo}.`
      const suggestions = [
        `Make sure there is a file at that path.`,
        `Make sure you are using a GitHub token that allows you to retrieve content from repository ${owner}/${repo}.`
      ]
      log.error(`${summary} ${suggestions.join(' ')}`)
      throw new Error(`${summary} ${suggestions.join(' ')}`)
    } else {
      const summary = `Retrieved file ${loc.store} from repository ${owner}/${repo}.`
      const { content: base64, sha } = result.value.body
      // The next function could become a parameter: contentToJf2
      const jf2 = markdownToJf2(base64ToUtf8(base64))
      return { jf2, summary, metadata: { sha } }
    }
  }

  return retrieveContent
}
