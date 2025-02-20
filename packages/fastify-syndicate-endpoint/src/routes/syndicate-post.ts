import canonicalUrl from '@jackdbd/canonical-url'
// import type { Location } from '@jackdbd/micropub'
import type {
  RetrievePost,
  UpdatePost,
  WebsiteUrlToStoreLocation
} from '@jackdbd/micropub/schemas/user-provided-functions'
import { InvalidRequestError } from '@jackdbd/oauth2-error-responses'
import type { RouteHandler } from 'fastify'
import { XMLParser } from 'fast-xml-parser'
import type { Syndicator } from '../schemas/syndicator.js'
// import { processPost } from './process-one-post.js'
import { processFeedEntry, type FeedEntry } from './process-feed-entry.js'

export interface Options {
  logPrefix: string
  me: string
  retrievePost: RetrievePost
  syndicatorMap: { [uid: string]: Syndicator }
  updatePost: UpdatePost
  urlToLocation: WebsiteUrlToStoreLocation
}

const defaults: Partial<Options> = {
  syndicatorMap: {}
}

const REQUIRED = ['me', 'retrievePost', 'updatePost', 'urlToLocation'] as const

export const defSyndicatePost = (options: Options) => {
  const config = Object.assign({}, defaults, options) as Required<Options>

  const {
    logPrefix,
    me,
    retrievePost,
    syndicatorMap,
    updatePost,
    urlToLocation
  } = config

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' is not set`)
    }
  })

  const canonical_me = new URL(canonicalUrl(me))
  console.log(`=== canonical me ===`, canonical_me)

  const parser = new XMLParser()

  const syndicatePost: RouteHandler = async (request, reply) => {
    // TODO: decide what request body to expect. For example:
    // 1. a URL pointing to a single post (e.g. a single note)
    // 2. a URL pointing to a feed (e.g. all notes)
    const { feed } = request.body as any
    // If it's a feed, we need to fetch it with a GET. If it's a single post, we
    // can simply check it exists using method: 'HEAD' (and then retrieve it
    // from the store).

    const canonical_url_feed = canonicalUrl(feed)

    if (!canonical_url_feed.includes(canonical_me.hostname)) {
      const reason = `The canonical URL of the feed is ${canonical_url_feed}, while the \`me\` hostname is ${canonical_me.hostname}.`
      throw new InvalidRequestError({ error_description: reason })
    }

    let response: Response
    try {
      response = await fetch(feed, { method: 'GET' })
    } catch (ex: any) {
      const error_description = `Cannot fetch feed at ${feed}: ${ex.message}`
      // what to throw? ServerError? InvalidRequestError?
      throw new InvalidRequestError({ error_description })
    }

    let xml: string
    try {
      xml = await response.text()
    } catch (ex: any) {
      const error_description = `Cannot generate XML feed from response: ${ex.message}`
      // what to throw? ServerError? InvalidRequestError?
      throw new InvalidRequestError({ error_description })
    }

    let obj: any
    try {
      obj = parser.parse(xml)
    } catch (ex: any) {
      const error_description = `Cannot parse XML feed: ${ex.message}`
      // what to throw? ServerError? InvalidRequestError?
      throw new InvalidRequestError({ error_description })
    }

    const feed_title = obj.feed.title
    if (feed_title) {
      request.log.debug(
        `${logPrefix}start processing feed ${feed_title} (${obj.feed.entry.length} entries)`
      )
    } else {
      request.log.warn(
        `${logPrefix}start processing feed that has no title (${obj.feed.entry.length} entries)`
      )
    }

    const log = {
      debug: request.log.debug.bind(request.log),
      info: request.log.info.bind(request.log),
      warn: request.log.warn.bind(request.log),
      error: request.log.error.bind(request.log)
    }

    const failures: string[] = []
    const successes: string[] = []

    const promises = obj.feed.entry.map((entry: FeedEntry) => {
      return processFeedEntry({
        entry,
        log,
        logPrefix: '[process-feed-entry] ',
        me,
        retrievePost,
        syndicatorMap,
        // always syndicate to Telegram chat, no matter the mp-syndicate-to in the
        // Micropub post.
        targets: ['https://t.me/+rQSrJsu5RtgzNjM0'],
        updatePost,
        urlToLocation
      })
    })

    const results = await Promise.all(promises)
    // console.log('=== results ===')
    // console.log(JSON.stringify(results, null, 2))

    results.forEach((result) => {
      failures.push(...result.failures)
      successes.push(...result.successes)
    })

    // ====================================================================== //
    // Testing a bookmark-of
    // const loc = {
    //   store: 'bookmarks/test-bookmark.md',
    //   website: 'https://www.giacomodebidda.com/bookmarks/indiekit-on-indieweb/'
    // }

    // Testing a like-of
    // const loc = {
    //   store: 'likes/test-like.md',
    //   website:
    //     'https://www.giacomodebidda.com/likes/content-divorced-from-presentation/'
    // }

    // Testing a note
    // const loc = {
    //   // store: 'notes/test-note.md',
    //   store: 'notes/kitesurfing-at-el-medano.md',
    //   // website: 'https://www.giacomodebidda.com/notes/test-note/',
    //   website: 'https://www.giacomodebidda.com/notes/kitesurfing-at-el-medano/'
    // }
    // ====================================================================== //

    // const result = await processPost({
    //   location: loc,
    //   log,
    //   me,
    //   logPrefix: '[syndication] ',
    //   retrievePost,
    //   syndicatorMap,
    //   // always syndicate to Telegram chat, no matter the mp-syndicate-to in the
    //   // Micropub post.
    //   targets: ['https://t.me/+rQSrJsu5RtgzNjM0'],
    //   updatePost
    // })

    // result.failures.forEach((f) => failures.push(f))
    // result.successes.forEach((s) => successes.push(s))

    const summary = [
      `Syndication of feed ${canonical_url_feed} completed.`,
      `The feed had ${promises.length} entries.`,
      `${successes.length} successes.`,
      `${failures.length} failures.`
    ].join(' ')

    return reply.code(200).send({ successes, failures, summary })
  }

  return syndicatePost
}
