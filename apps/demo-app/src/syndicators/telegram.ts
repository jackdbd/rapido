import { Syndicator } from '@jackdbd/fastify-syndicate-endpoint'
import { isMpUrlencodedRequestBody } from '@jackdbd/micropub'
import type {
  CreateContentToSyndicate,
  JF2ToContent,
  PostType,
  RetrieveContentsToSyndicate,
  Syndicate
} from '@jackdbd/micropub'
import { send } from '@jackdbd/notifications/telegram'
import { DEFAULT } from './defaults.js'
import { Log } from './log.js'

export const EMOJI = {
  AUDIO: '🎵',
  BOOKMARK: '🔖', // 🔗
  CARD: '💳',
  CITE: '🗣️', // 🗣️ 💬
  CONTENT: '📝',
  ENTRY: '📝',
  EVENT: '🍻',
  LIKE: '❤️', // ❤️ 👍
  LOCATION: '📍',
  PHOTO: '📷',
  REPOST: '♻', // ♺ ♻ ♲ ♳ ♴ ♽
  VIDEO: '🎞️' // 🎥📹
}

export interface Options {
  chat_id?: string
  disable_notification?: boolean
  disable_web_page_preview?: boolean
  log?: Log
  name?: string
  token?: string
  uid: string
}

const defaults = {
  chat_id: DEFAULT.chat_id,
  disable_notification: DEFAULT.disable_notification,
  disable_web_page_preview: DEFAULT.disable_web_page_preview,
  log: DEFAULT.log,
  token: DEFAULT.token
}

const REQUIRED = ['chat_id', 'log', 'token', 'uid'] as const

export const defSyndicator = (options: Options): Syndicator => {
  const config = Object.assign({}, defaults, options)

  if (!config.chat_id) {
    throw new Error(`Telegram chat_id not set`)
  }

  if (!config.token) {
    throw new Error(`Telegram token not set`)
  }

  REQUIRED.forEach((k) => {
    if (!config[k]) {
      throw new Error(`parameter '${k}' is not set`)
    }
  })

  const {
    chat_id,
    disable_notification,
    disable_web_page_preview,
    log,
    token,
    uid
  } = config

  const name = config.name || `Telegram chat ${chat_id}`

  const jf2ToContent: JF2ToContent = (input) => {
    let post_type: PostType
    if (isMpUrlencodedRequestBody(input)) {
      post_type = input.h || 'entry'
    } else {
      post_type = input.type || 'entry'
    }

    const jf2 = { ...input, type: post_type }

    log.debug(`converting Micropub ${post_type} to Telegram message`)

    let title: string
    switch (post_type) {
      case 'card': {
        title = `${EMOJI.CARD} <b>Micropub ${post_type}</b>`
        break
      }
      case 'cite': {
        title = `${EMOJI.CITE} <b>Micropub ${post_type}</b>`
        break
      }
      case 'event': {
        title = `${EMOJI.EVENT} <b>Micropub ${post_type}</b>`
        break
      }
      default: {
        title = `${EMOJI.ENTRY} <b>Micropub ${post_type}</b>`
      }
    }

    const lines = [title]

    // We put the photo first, so it's rendered by a Telegram client.
    // audio/photo/video
    // https://jf2.spec.indieweb.org/#multiple-urls
    if (jf2.photo) {
      console.log('=== jf2.photo ===')
      console.log(JSON.stringify(jf2.photo, null, 2))
      const xs = Array.isArray(jf2.photo) ? jf2.photo : [jf2.photo]
      log.debug(`adding ${xs.length} photo to Telegram message`)
      xs.forEach((x) => {
        if (typeof x === 'string') {
          lines.push(`${EMOJI.PHOTO} <a href="${x}">Photo</a>`)
        } else {
          lines.push(`${EMOJI.PHOTO} <a href="${x.value}">${x.alt}</a>`)
        }
      })
    }

    if (jf2.audio) {
      console.log('=== jf2.audio ===')
      console.log(JSON.stringify(jf2.audio, null, 2))
      const xs = Array.isArray(jf2.audio) ? jf2.audio : [jf2.audio]
      log.debug(`adding ${xs.length} audio to Telegram message`)
      xs.forEach((x) => {
        lines.push(`${EMOJI.AUDIO} <a href="${x}">${x}</a>`)
      })
    }

    if (jf2.video) {
      console.log('=== jf2.video ===')
      console.log(JSON.stringify(jf2.video, null, 2))
      const xs = Array.isArray(jf2.video) ? jf2.video : [jf2.video]
      log.debug(`adding ${xs.length} video to Telegram message`)
      xs.forEach((x) => {
        lines.push(`${EMOJI.VIDEO} <a href="${x}">${x}</a>`)
      })
    }

    if (jf2['bookmark-of']) {
      lines.push(`${EMOJI.BOOKMARK} ${jf2['bookmark-of']}`)
    }

    if (jf2['like-of']) {
      lines.push(`${EMOJI.LIKE} ${jf2['like-of']}`)
    }

    if (jf2['repost-of']) {
      lines.push(`${EMOJI.REPOST} ${jf2['repost-of']}`)
    }

    if (jf2.content) {
      log.debug(`adding content of JF2 object to Telegram message`)
      if (typeof jf2.content === 'string') {
        if (jf2.content !== '') {
          // TODO: maybe allow the user to configure what to do in this case: throw / log / ignore / use a default
          log.warn(`JF2 object has an empty string as its content`)
          console.warn('=== jf2.content is empty ===')
          console.log(JSON.stringify(jf2, null, 2))
        } else {
          lines.push(jf2.content)
        }
      } else {
        if (jf2.content.text) {
          if (jf2.content.text !== '') {
            lines.push(jf2.content.text)
          } else {
            log.warn(`JF2 object has an empty string in content.text`)
            console.warn('=== jf2.content.text is empty ===')
            console.log(JSON.stringify(jf2, null, 2))
          }
        } else if (jf2.content.html) {
          if (jf2.content.html !== '') {
            // TODO: sanitize the HTML and convert it to a format supported by
            // the medium where we syndicate this content to (e.g. simple HTML
            // if we are syndicating to Telegram, plain text for LinkedIn, etc).
            lines.push(jf2.content.html)
          } else {
            log.warn(`JF2 object has an empty string in content.html`)
            console.warn('=== jf2.content.html is empty ===')
            console.log(JSON.stringify(jf2, null, 2))
          }
        } else {
          log.warn(`JF2 object has neither content.text nor content.html`)
          console.warn('=== neither jf2.content.text nor jf2.content.html ===')
          console.log(JSON.stringify(jf2, null, 2))
        }
      }
    }

    if (jf2.location) {
      log.debug(`adding location of JF2 object to Telegram message`)
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
      log.debug(`adding category of JF2 object to Telegram message`)
      let tags: string
      if (typeof jf2.category === 'string') {
        tags = jf2.category
      } else {
        tags = jf2.category.join(', ')
      }
      lines.push(`Tags: ${tags}`)
    }

    // Include other fields in the Telegram text? author, date, etc...

    // lines.push(`Syndicated from <a>${url}</a>`)

    return lines.join('\n\n')
  }

  const syndicate: Syndicate = async (props) => {
    const { canonicalUrl, content: text } = props

    try {
      log.debug(
        `try syndicating ${canonicalUrl} to Telegram chat ID ${chat_id}`
      )
      const result = await send(
        { chat_id, token, text },
        { disable_notification, disable_web_page_preview }
      )

      if (result.delivered) {
        const summary = `Syndicated ${canonicalUrl} to Telegram chat ID ${chat_id}.`
        const details = [result.message]
        const message = `${summary} ${details.join(' ')}`
        log.debug(message)
        return {
          value: {
            // syndication: 'fake-telegram-url',
            summary,
            uid,
            payload: {
              delivered: result.delivered,
              delivered_at: result.delivered_at
            }
          }
        }
      } else {
        const summary = `Message not delivered to Telegram chat ID ${chat_id}.`
        const suggestions = [
          `Make sure that the Telegram chat ID is correct.`,
          `Make sure that the Telegram Bot token is correct.`
        ]
        const message = `${summary} ${suggestions.join(' ')}`
        log.error(message)
        return { error: new Error(message) }
      }
    } catch (ex: any) {
      const summary =
        ex && ex.message
          ? ex.message
          : `Unknown error in Telegram syndicator ${uid} syndicate function.`
      log.error(summary)
      return { error: new Error(summary) }
    }
  }

  const createContentToSyndicate: CreateContentToSyndicate = async (props) => {
    log.debug(
      props,
      `create content to syndicate to Telegram chat ID ${chat_id}`
    )
    return {}
  }

  const retrieveContentsToSyndicate: RetrieveContentsToSyndicate = async (
    props
  ) => {
    log.debug(
      props,
      `retrieve content to syndicate to Telegram chat ID ${chat_id}`
    )

    return {}
  }

  return {
    createContentToSyndicate,
    jf2ToContent,
    name,
    retrieveContentsToSyndicate,
    uid,
    syndicate
  }
}
