import canonicalUrl from '@jackdbd/canonical-url'
import type {
  RetrievePost,
  UpdatePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub'
import type { Syndicator } from '../schemas/syndicator.js'
import type { Log } from './log.js'
import { processPost } from './process-one-post.js'

export interface FeedEntry {
  id: string
  content?: string
  published?: string
  summary?: string
  updated?: string
}

export interface Options {
  entry: FeedEntry
  log?: Log
  logPrefix?: string
  me: string
  retrievePost: RetrievePost
  syndicatorMap: { [uid: string]: Syndicator }
  /**
   * Default syndication targets (as list of uid)
   */
  targets?: string[]
  updatePost: UpdatePost
  urlToLocation: WebsiteUrlToStoreLocation
}

const defaults = {
  log: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  },
  logPrefix: '',
  targets: []
}

export const processFeedEntry = async (options: Options) => {
  const config = Object.assign({}, defaults, options)

  const {
    log,
    entry: feed_entry,
    logPrefix,
    me,
    retrievePost,
    syndicatorMap,
    targets,
    updatePost,
    urlToLocation
  } = config

  const canonical_url = canonicalUrl(feed_entry.id)

  const location = urlToLocation(canonical_url)

  return await processPost({
    me,
    location,
    log,
    logPrefix,
    retrievePost,
    syndicatorMap,
    targets,
    updatePost
  })
}
