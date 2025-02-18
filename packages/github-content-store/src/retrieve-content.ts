import type { RetrievePost } from '@jackdbd/micropub/schemas/user-provided-functions'
import { get, BASE_URL, GITHUB_TOKEN, REF } from '@jackdbd/github-contents-api'
import { base64ToUtf8 } from './encoding.js'
import { defaultLog, type Log } from './log.js'
import { markdownToJf2 } from './markdown-to-jf2.js'

export interface Options {
  base_url?: string
  log?: Log
  owner?: string
  ref?: string
  repo?: string
  token?: string
}

const defaults: Partial<Options> = {
  base_url: BASE_URL,
  log: defaultLog,
  ref: REF,
  token: GITHUB_TOKEN
}

export const defRetrieveContent = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const { base_url, log, owner, ref, repo, token } = config

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
      const summary = `Cannot retrieve ${loc.store} from repository ${owner}/${repo}.`
      const suggestions = [
        `Make sure there is a file at that path.`,
        `Make sure you are using a GitHub token that allows you to retrieve content from repository ${owner}/${repo}.`
      ]
      log.error(`${summary}. ${suggestions.join(' ')}`)
      throw new Error(`${summary}. ${suggestions.join(' ')}`)
    } else {
      const { content: base64, sha } = result.value.body
      // This could become a parameter: contentToJf2
      const jf2 = markdownToJf2(base64ToUtf8(base64))
      return { jf2, sha }
    }
  }

  return retrieveContent
}
