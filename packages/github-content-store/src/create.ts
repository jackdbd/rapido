import { createOrUpdate } from '@jackdbd/github-contents-api'
import type { AuthorOrCommitter } from '@jackdbd/github-contents-api'
import { isMpUrlencodedRequestBody } from '@jackdbd/micropub'
import type {
  CreatePost,
  JF2ToLocation,
  PostType
} from '@jackdbd/micropub/schemas/index'
import { DEFAULT } from './defaults.js'
import { jf2ToContent } from './jf2-to-content.js'
import type { Log } from './log.js'

export interface Options {
  author?: AuthorOrCommitter
  base_url?: string
  branch?: string
  committer: AuthorOrCommitter
  jf2ToLocation: JF2ToLocation
  log?: Log
  name?: string
  owner: string
  repo: string
  token?: string
}

const defaults: Partial<Options> = {
  base_url: DEFAULT.base_url,
  branch: DEFAULT.branch,
  log: DEFAULT.log,
  name: DEFAULT.name,
  token: DEFAULT.token
}

const REQUIRED = ['committer', 'log', 'name', 'owner', 'repo', 'token'] as const

export const defCreate = (options?: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    author,
    base_url,
    branch,
    committer,
    jf2ToLocation,
    log,
    name,
    owner,
    repo,
    token
  } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(
        `parameter '${k}' for '${name}' create-content is not set`
      )
    }
  })

  const create: CreatePost = async (input) => {
    let post_type: PostType
    if (isMpUrlencodedRequestBody(input)) {
      post_type = input.h || 'entry'
    } else {
      post_type = input.type || 'entry'
    }

    const jf2 = { ...input, type: post_type }
    const loc = jf2ToLocation(jf2)
    const content = jf2ToContent(jf2)

    // TODO: if the `me` website already has a post with the same slug as the
    // one suggested suggested with `mp-slug`, we could regenerate a new slug
    // (maybe with an UUID) and try again. We would need to know the matching
    // URL => location in store and website. We could put the for loop above in
    // a function that takes `publication` and outputs `loc`.
    // We would also need to know whether the content is HTML or plain text, so
    // we can use the correct file extension when saving the file in the store.
    // See also: https://indieweb.org/Micropub-extensions#Slug

    log.debug(
      `trying to store Micropub post type=${jf2.type} as base64-encoded string at ${loc.store}`
    )

    const result = await createOrUpdate({
      author,
      base_url,
      branch,
      committer,
      content,
      log,
      owner,
      path: loc.store,
      repo,
      token
    })

    if (result.error) {
      // The original error message from the GitHub Contents API is not that useful.
      const summary = `Cannot create ${loc.store} in repository ${owner}/${repo}.`
      const suggestions = [`Make sure there isn't already a file at that path.`]
      log.error(`${summary}. ${suggestions.join(' ')}`)
      throw new Error(`${summary}. ${suggestions.join(' ')}`)
    } else {
      const summary = `Post created. It will be published at ${loc.website}.`
      const details = [
        `Micropub post type=${jf2.type} created at ${loc.store} in repo ${owner}/${repo} on branch ${branch}.`,
        `Committed by ${committer.name} (${committer.email}).`
      ]
      log.debug(summary)
      details.forEach(log.debug)
      return { summary, details }
    }
  }

  return create
}
