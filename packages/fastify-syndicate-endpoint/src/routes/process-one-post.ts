import canonicalUrl from '@jackdbd/canonical-url'
import { normalizeJf2, jf2WithNoSensitiveProps } from '@jackdbd/micropub'
import type {
  JF2,
  Location,
  RetrievePost,
  UpdatePatch,
  UpdatePost
} from '@jackdbd/micropub'
import type { Syndicator } from '../schemas/syndicator.js'
import type { Log } from './log.js'

export interface Options {
  me: string
  location: Location
  log?: Log
  logPrefix?: string
  retrievePost: RetrievePost
  syndicatorMap: { [uid: string]: Syndicator }
  /**
   * Default syndication targets (as list of uid)
   */
  targets?: string[]
  updatePost: UpdatePost
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

// TODO: use the post's URL to understand what type of post this is (e.g.
// card, event, note, bookmark, etc.)
// TODO: consider validating each feed entry against a schema
// TODO: what if the post is not at the given URL? HTTP redirects 301,
// 302, 307, 308, and not found 404 (maybe others?). Maybe the user could
// provide a list of redirects in the options? E.g. the content of a
// _redirects file (Cloudflare Pages), vercel.json, etc.

export const processPost = async (options: Options) => {
  const config = Object.assign({}, defaults, options)

  const {
    location,
    log,
    logPrefix,
    me,
    retrievePost,
    syndicatorMap,
    updatePost
  } = config

  const target_set = new Set(config.targets)

  const failures: string[] = []
  const successes: string[] = []

  const canonical_url = canonicalUrl(location.website)
  const canonical_me = canonicalUrl(me)
  const me_hostname = new URL(canonical_me).hostname

  // The post could have been deleted, moved to a different URL, the server
  // where it is hosted could be down, etc.)
  log.debug(
    `${logPrefix}validating that the post is available online at ${canonical_url}`
  )
  const response = await fetch(location.website, { method: 'HEAD' })

  // If fetch follows a redirect, response.url will contain the final URL after
  // all redirects. I guess a redirect in this case count as a failure (it's
  // safer to update the URL of the Micropub post in the content store).
  if (response.redirected) {
    const reason = `${canonical_url} is no longer at ${canonical_url} but it is now at ${response.url}.`
    log.warn(reason)
    failures.push(reason)
    return { failures, successes }
  }

  if (!response.ok) {
    const reason = `URL ${location.website} is not online.`
    failures.push(reason)
    return { failures, successes }
  }

  log.debug(
    `${logPrefix}validating that the post online at ${canonical_url} belongs to ${canonical_me}`
  )
  if (!canonical_url.includes(me_hostname)) {
    const reason = `The canonical URL of the post is ${canonical_url}, while the canonical \`me\` is ${canonical_me}.`
    failures.push(reason)
    return { failures, successes }
  }

  let jf2: JF2
  try {
    log.debug(`${logPrefix}retrieve post from store location ${location.store}`)
    const value = await retrievePost(location)
    jf2 = value.jf2
  } catch (ex: any) {
    const reason = `Cannot retrieve post at this location: ${location.website} (website), ${location.store} (store). ${ex.message}`
    failures.push(reason)
    return { failures, successes }
  }

  // A Micropub post SHOULD be stored with all sensitive properties stripped
  // away (e.g. access_token). However, we cannot exclude the possibility that
  // we are dealing with a post that was not stored correctly, or that was
  // stored correctly but then updated by a rogue actor. So we MUST sanitize it.
  log.debug(jf2, `${logPrefix}post before sanitization`)
  jf2 = jf2WithNoSensitiveProps(jf2)
  log.debug(jf2, `${logPrefix}post after sanitization`)

  // A Micropub post SHOULD be stored as JF2 JSON (i.e. it should have a "type"
  // property), but we cannot exclude the possibility that it was stored as a
  // parsed `application/x-www-form-urlencoded` or `multipart/form-data` object
  // (i.e. it has a "h") property.
  log.debug(jf2, `${logPrefix}post before normalization`)
  jf2 = normalizeJf2(jf2)
  log.debug(jf2, `${logPrefix}post after normalization`)

  if (jf2['mp-syndicate-to']) {
    if (typeof jf2['mp-syndicate-to'] === 'string') {
      target_set.add(jf2['mp-syndicate-to'])
    } else {
      jf2['mp-syndicate-to'].forEach((str) => target_set.add(str))
    }
  }

  const targets = [...target_set]

  log.debug(
    `${logPrefix}post published at ${canonical_url} has ${targets.length} syndication targets: ${targets.join(', ')}`
  )

  // TODO: put these calls in a queue, do not call a 3rd party service directly!
  // Also, if I enqueue the requests, I probably can't, nor need, to process
  // the results of the syndication. It's basically a set and forget operation.
  // BUT...
  // I do need to update the Micropub post from `mp-syndicate-to` to
  // `syndication`. And MAYBE also use a lock when writing on each post? Or
  // maybe wait for all syndication results, and update the post only once.
  const results = await Promise.allSettled(
    targets.map((target) => {
      const syndicator = syndicatorMap[target]
      if (syndicator) {
        const { jf2ToContent, name, syndicate, uid } = syndicator
        log.debug(
          `${logPrefix}converting JF2 => content suitable for syndicator ${name} (uid: ${uid})`
        )
        const content = jf2ToContent(jf2)
        log.debug(
          `${logPrefix}posting ${canonical_url} to ${target} using syndicator ${name} (uid: ${uid})`
        )
        return syndicate({ canonicalUrl: canonical_url, content })
      } else {
        const reason = `No syndicator matches target '${target}'.`
        return Promise.reject(reason)
      }
    })
  )

  const mp_syndicate_to = new Set<string>()
  if (jf2['mp-syndicate-to']) {
    if (typeof jf2['mp-syndicate-to'] === 'string') {
      mp_syndicate_to.add(jf2['mp-syndicate-to'])
    } else {
      jf2['mp-syndicate-to'].forEach((str) => mp_syndicate_to.add(str))
    }
  }

  const syndication = new Set<string>()
  if (jf2.syndication) {
    if (typeof jf2.syndication === 'string') {
      syndication.add(jf2.syndication)
    } else {
      jf2.syndication.forEach((str) => syndication.add(str))
    }
  }

  log.debug(
    {
      'mp-syndicate-to': jf2['mp-syndicate-to'],
      syndication: jf2.syndication
    },
    `${logPrefix}mp-syndicate-to/syndication before`
  )

  for (const res of results) {
    if (res.status === 'rejected') {
      log.error(`${logPrefix}${res.reason}`)
      failures.push(res.reason)
    } else {
      if (res.value.error) {
        const reason =
          res.value.error.message ||
          'The error returned from the syndicator had no message'
        log.error(`${logPrefix}${reason}`)
        failures.push(reason)
      } else {
        // console.log('=== res.value.value ===', res.value.value)
        const v = res.value.value

        let summary: string
        if (v.syndication) {
          syndication.add(v.syndication)
          mp_syndicate_to.delete(v.uid)
          summary = `${canonical_url} syndicated to target ${v.syndication}`
        } else {
          syndication.add(v.uid)
          mp_syndicate_to.delete(v.uid)
          summary = `${canonical_url} syndicated to target ${v.uid}`
        }
        log.debug(`${logPrefix}${summary}`)
        successes.push(summary)
      }
    }
  }

  const patch: UpdatePatch = {
    delete: 'mp-syndicated-to',
    replace: {
      'mp-syndicate-to': [...mp_syndicate_to],
      syndication: [...syndication]
    }
  }

  log.debug(patch, `${logPrefix}update patch for post at ${canonical_url}`)

  const update_post_result = await updatePost(canonical_url, patch)
  console.log('=== update_post_result ===', update_post_result)

  return { failures, successes }
}
