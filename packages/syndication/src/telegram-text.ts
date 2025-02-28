import type { JF2_Application_JSON } from '@jackdbd/micropub'
import {
  isBookmark,
  isLike,
  isRead,
  isRepost,
  isRsvp
} from '@jackdbd/micropub/jf2-predicates'
import { EMOJI, nop_log, type Log } from '@repo/stdlib'

export interface Config {
  canonicalUrl: URL | string
  emoji?: Record<string, string>
  jf2: JF2_Application_JSON
  log?: Log
}

// required config after all defaults have been applied
const REQUIRED = ['canonicalUrl', 'emoji', 'jf2', 'log'] as const

const defaults = {
  emoji: EMOJI,
  log: nop_log
}

/**
 * Telegram text created from a single JF2 object.
 *
 * This function does not send any text. It justs converts a single JF2 object
 * into a single text. THis function does **NOT** check if the content stays
 * within the character limit of the [Telegram Bot `sendMessage` API](https://core.telegram.org/bots/api#sendmessage).
 */

export const defText = (config: Config) => {
  const cfg = Object.assign({}, defaults, config)

  REQUIRED.forEach((key) => {
    if (!cfg[key]) {
      throw new Error(`${key} is required.`)
    }
  })

  const { emoji, log } = cfg

  let href: string
  if (typeof cfg.canonicalUrl === 'string') {
    href = cfg.canonicalUrl
  } else {
    href = cfg.canonicalUrl.href
  }

  let jf2: JF2_Application_JSON
  const jf2_type = config.jf2.type
  switch (jf2_type) {
    case 'card': {
      throw new Error(
        `TODO: unsupported conversion ${jf2_type} => Telegram text`
      )
    }

    case 'cite': {
      throw new Error(
        `TODO: unsupported conversion ${jf2_type} => Telegram text`
      )
    }

    case 'event': {
      jf2 = { ...config.jf2, type: 'event' }
      break
    }

    default: {
      jf2 = { ...config.jf2, type: 'entry' }

      if (isBookmark(jf2)) {
        jf2.type = 'bookmark'
      } else if (isLike(jf2)) {
        jf2.type = 'like'
      } else if (isRead(jf2)) {
        jf2.type = 'read'
      } else if (isRepost(jf2)) {
        jf2.type = 'repost'
      } else if (isRsvp(jf2)) {
        jf2.type = 'rsvp'
      } else {
        // throw new Error(`Unsupported Micropub post type: ${jf2.type}`)
        // I THINK I read somewhere that when the JF2 type is 'entry', the
        // default Micropub post should be 'note'.
        jf2.type = 'note'
      }
    }
  }

  if (!jf2.type) {
    throw new Error(`Micropub post type not set`)
  }

  const title = `${emoji[jf2.type.toUpperCase()]} <b>Micropub ${jf2.type}</b>`

  const lines = [title]

  // We put the photo first, so it's rendered by a Telegram client.
  // audio/photo/video
  // https://jf2.spec.indieweb.org/#multiple-urls
  if (jf2.photo) {
    log.debug(JSON.stringify(jf2.photo, null, 2), 'jf2.photo')
    const xs = Array.isArray(jf2.photo) ? jf2.photo : [jf2.photo]
    log.debug(`adding ${xs.length} photo`)
    xs.forEach((x) => {
      if (typeof x === 'string') {
        lines.push(`${EMOJI.PHOTO} <a href="${x}">Photo</a>`)
      } else {
        lines.push(`${EMOJI.PHOTO} <a href="${x.value}">${x.alt}</a>`)
      }
    })
  }

  if (jf2.audio) {
    log.debug(JSON.stringify(jf2.audio, null, 2), 'jf2.audio')
    const xs = Array.isArray(jf2.audio) ? jf2.audio : [jf2.audio]
    log.debug(`adding ${xs.length} audio`)
    xs.forEach((x) => {
      lines.push(`${EMOJI.AUDIO} <a href="${x}">${x}</a>`)
    })
  }

  if (jf2.video) {
    log.debug(JSON.stringify(jf2.video, null, 2), 'jf2.video')
    const xs = Array.isArray(jf2.video) ? jf2.video : [jf2.video]
    log.debug(`adding ${xs.length} video`)
    xs.forEach((x) => {
      lines.push(`${EMOJI.VIDEO} <a href="${x}">${x}</a>`)
    })
  }

  if (isBookmark(jf2)) {
    lines.push(`${emoji.BOOKMARK} ${jf2['bookmark-of']}`)
  }

  if (isLike(jf2)) {
    lines.push(`${emoji.LIKE} ${jf2['like-of']}`)
  }

  if (isRepost(jf2)) {
    lines.push(`${emoji.REPOST} ${jf2['repost-of']}`)
  }

  if (jf2.summary) {
    log.debug(`adding summary`)
    lines.push(jf2.summary)
  }

  if (jf2.content) {
    log.debug(`adding content`)
    if (typeof jf2.content === 'string') {
      if (jf2.content === '') {
        // TODO: maybe allow the user to configure what to do in this case: throw / log / ignore / use a default
        log.warn(jf2, `JF2 object has an empty string as its content`)
      } else {
        lines.push(jf2.content)
      }
    } else {
      if (jf2.content.text) {
        if (jf2.content.text !== '') {
          lines.push(jf2.content.text)
        } else {
          log.warn(`JF2 object has an empty string in content.text`)
          log.warn(jf2, '=== jf2.content.text is empty ===')
        }
      } else if (jf2.content.html) {
        if (jf2.content.html !== '') {
          // TODO: sanitize the HTML and convert it to a format supported by
          // the medium where we syndicate this content to (e.g. simple HTML
          // if we are syndicating to Telegram, plain text for LinkedIn, etc).
          lines.push(jf2.content.html)
        } else {
          log.warn(`JF2 object has an empty string in content.html`)
          log.warn(jf2, '=== jf2.content.html is empty ===')
        }
      } else {
        log.warn(`JF2 object has neither content.text nor content.html`)
        log.warn(jf2, '=== neither jf2.content.text nor jf2.content.html ===')
      }
    }
  }

  if (jf2.location) {
    log.debug(`adding location`)
    if (typeof jf2.location === 'string') {
      const lat_long_alt = jf2.location.split('geo:')[1]!
      const lat_long = lat_long_alt.split(';')[0]
      const href = `https://www.google.com/maps?q=${lat_long}`
      lines.push(`${EMOJI.LOCATION} <a href="${href}">Location</a>`)
    } else {
      const { latitude, longitude } = jf2.location
      if (latitude && longitude) {
        const href = `https://www.google.com/maps?q=${latitude},${longitude}`
        lines.push(`${EMOJI.LOCATION} <a href="${href}">Location</a>`)
      }
    }
  }

  if (jf2.category) {
    log.debug(`adding category`)
    let tags: string
    if (typeof jf2.category === 'string') {
      tags = jf2.category
    } else {
      tags = jf2.category.join(', ')
    }
    lines.push(`Tags: ${tags}`)
  }

  if (jf2.published) {
    log.debug(`adding publication`)
    lines.push(`Published: ${jf2.published}`)
  }

  // Include other fields in the Telegram text? author, date, etc...

  lines.push(`Syndicated from <a href="${href}">${href}</a>`)

  const text = lines.join('\n\n')
  return text
}
